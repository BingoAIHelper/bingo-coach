import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bingo</h3>
            <p className="text-sm text-muted-foreground">
              A comprehensive job coaching platform for individuals with disabilities.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/coaches" className="text-sm text-muted-foreground hover:text-foreground">
                  Coaches
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-sm text-muted-foreground hover:text-foreground">
                  Resume
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/training" className="text-sm text-muted-foreground hover:text-foreground">
                  Training
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm text-muted-foreground hover:text-foreground">
                  Chat
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="text-sm text-muted-foreground hover:text-foreground">
                  Calendar
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-sm text-muted-foreground hover:text-foreground">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/accessibility-statement" className="text-sm text-muted-foreground hover:text-foreground">
                  Accessibility Statement
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bingo. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://twitter.com" className="text-sm text-muted-foreground hover:text-foreground">
              Twitter
            </Link>
            <Link href="https://linkedin.com" className="text-sm text-muted-foreground hover:text-foreground">
              LinkedIn
            </Link>
            <Link href="https://facebook.com" className="text-sm text-muted-foreground hover:text-foreground">
              Facebook
            </Link>
            <Link href="https://instagram.com" className="text-sm text-muted-foreground hover:text-foreground">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 