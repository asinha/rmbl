// lib/store/slices/subscriptionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface SubscriptionHistory {
  id: string;
  userId: string;
  transactionId?: string;
  planType: string;
  status: "active" | "cancelled" | "expired" | "paused";
  billingCycle?: string;
  amount?: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface SubscriptionUsage {
  recordingMinutes: number;
  recordingCount: number;
  monthlyLimit: number;
  resetDate: string;
}

interface SubscriptionState {
  history: SubscriptionHistory[];
  usage: SubscriptionUsage | null;
  loading: boolean;
  error: string | null;
  limits: {
    free: { recordingMinutes: number; recordingCount: number };
    monthly: { recordingMinutes: number; recordingCount: number };
    annual: { recordingMinutes: number; recordingCount: number };
    lifetime: { recordingMinutes: number; recordingCount: number };
  };
}

const initialState: SubscriptionState = {
  history: [],
  usage: null,
  loading: false,
  error: null,
  limits: {
    free: { recordingMinutes: 10, recordingCount: 3 },
    monthly: { recordingMinutes: -1, recordingCount: -1 }, // -1 means unlimited
    annual: { recordingMinutes: -1, recordingCount: -1 },
    lifetime: { recordingMinutes: -1, recordingCount: -1 },
  },
};

// Async thunks
export const fetchSubscriptionHistory = createAsyncThunk(
  "subscription/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/subscription/history");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription history");
      }
      const history = await response.json();
      return history;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const fetchSubscriptionUsage = createAsyncThunk(
  "subscription/fetchUsage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/subscription/usage");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription usage");
      }
      const usage = await response.json();
      return usage;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const updateSubscriptionUsage = createAsyncThunk(
  "subscription/updateUsage",
  async (
    {
      recordingMinutes,
      recordingCount,
    }: { recordingMinutes?: number; recordingCount?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/subscription/usage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recordingMinutes, recordingCount }),
      });

      if (!response.ok) {
        throw new Error("Failed to update usage");
      }

      const usage = await response.json();
      return usage;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "subscription/cancel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    incrementUsage: (
      state,
      action: PayloadAction<{ minutes?: number; count?: number }>
    ) => {
      if (state.usage) {
        if (action.payload.minutes) {
          state.usage.recordingMinutes += action.payload.minutes;
        }
        if (action.payload.count) {
          state.usage.recordingCount += action.payload.count;
        }
      }
    },
    resetUsage: (state) => {
      if (state.usage) {
        state.usage.recordingMinutes = 0;
        state.usage.recordingCount = 0;
        state.usage.resetDate = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscription history
      .addCase(fetchSubscriptionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchSubscriptionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch subscription usage
      .addCase(fetchSubscriptionUsage.fulfilled, (state, action) => {
        state.usage = action.payload;
      })
      // Update subscription usage
      .addCase(updateSubscriptionUsage.fulfilled, (state, action) => {
        state.usage = action.payload;
      })
      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.loading = false;
        // Add cancelled entry to history
        // This should be handled by the backend and reflected in the next fetch
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, incrementUsage, resetUsage } =
  subscriptionSlice.actions;
export default subscriptionSlice.reducer;
