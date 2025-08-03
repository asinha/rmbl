"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
export default function ProfilePage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-16 text-center">
        <p className="text-lg mb-4">Please sign in to view your profile</p>

        <Button size="lg">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="relative">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile picture"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl font-medium">
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="absolute -bottom-3 -right-3"
          >
            Edit
          </Button>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{user.fullName}</h1>
          <p className="text-muted-foreground mt-2">
            {user.primaryEmailAddress?.emailAddress}
          </p>

          <div className="flex gap-4 mt-4 justify-center md:justify-start">
            <Link href="/main/ideas">
              <Button className="flex items-center gap-2">
                <img src="/microphone.svg" className="size-5" />
                Continue RMBLing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">24</div>
          <div className="text-sm text-muted-foreground">Notes Taken</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">5.2h</div>
          <div className="text-sm text-muted-foreground">Audio Processed</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">87%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm text-muted-foreground">Templates</div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                First Name
              </label>
              <div className="border rounded-md p-3">
                {user.firstName || "Not set"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Last Name
              </label>
              <div className="border rounded-md p-3">
                {user.lastName || "Not set"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Username
              </label>
              <div className="border rounded-md p-3">
                {user.username || "Not set"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Email
              </label>
              <div className="border rounded-md p-3">
                {user.primaryEmailAddress?.emailAddress}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Default Note Format
              </label>
              <select className="border rounded-md p-3 w-full">
                <option>Markdown</option>
                <option>Plain Text</option>
                <option>Rich Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Audio Quality
              </label>
              <select className="border rounded-md p-3 w-full">
                <option>Standard (16kHz)</option>
                <option>High (32kHz)</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-save"
                className="size-4"
                defaultChecked
              />
              <label htmlFor="auto-save" className="text-sm font-medium">
                Auto-save recordings
              </label>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
