export const AuthFooter = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-2 px-4 py-[9px] items-center">
      <p className="text-xs text-center text-[#99a1af]">
        © {new Date().getFullYear()} RMBL. All rights reserved.
      </p>

      <div className="flex flex-row gap-4">
        <a
          href="https://github.com/your-org/rmbl"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#364153] hover:text-[#2563eb] transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://x.com/your-handle"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#364153] hover:text-[#2563eb] transition-colors"
        >
          Twitter
        </a>
        <a
          href="/privacy"
          className="text-xs text-[#364153] hover:text-[#2563eb] transition-colors"
        >
          Privacy
        </a>
        <a
          href="/terms"
          className="text-xs text-[#364153] hover:text-[#2563eb] transition-colors"
        >
          Terms
        </a>
      </div>
    </div>
  );
};
