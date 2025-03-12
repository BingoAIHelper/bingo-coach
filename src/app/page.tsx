import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <MainLayout>
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Bingo Job Coach Platform
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  A comprehensive job coaching platform designed for individuals with disabilities.
                  Find your perfect job match, connect with specialized coaches, and access resources
                  tailored to your needs.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/assessment">Start Your Assessment</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-[350px] rounded-full bg-gradient-to-b from-primary/20 to-primary/0 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">Accessible Job Coaching</h2>
                    <p className="text-muted-foreground mt-2">For everyone, everywhere</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform connects job seekers with disabilities to specialized coaches and
                employers who value diversity and inclusion.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 md:gap-8">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                1
              </div>
              <h3 className="text-xl font-bold">Complete Assessment</h3>
              <p className="text-center text-muted-foreground">
                Tell us about your skills, preferences, and accessibility needs.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                2
              </div>
              <h3 className="text-xl font-bold">Match with Coaches</h3>
              <p className="text-center text-muted-foreground">
                Get paired with job coaches who specialize in your specific needs.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                3
              </div>
              <h3 className="text-xl font-bold">Find Your Job</h3>
              <p className="text-center text-muted-foreground">
                Apply to jobs with employers committed to inclusive hiring practices.
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Features
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform is designed with accessibility at its core, offering a range of features
                to support your job search journey.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Personalized Job Matching</h3>
              <p className="text-muted-foreground">
                AI-powered job recommendations based on your skills and accessibility needs.
              </p>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Specialized Coaching</h3>
              <p className="text-muted-foreground">
                Connect with coaches who understand your specific disabilities and challenges.
              </p>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Accessible Interface</h3>
              <p className="text-muted-foreground">
                Fully customizable accessibility options to meet your individual needs.
              </p>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Resume Builder</h3>
              <p className="text-muted-foreground">
                Create professional resumes with our accessible tools and get AI-powered feedback.
              </p>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Interview Preparation</h3>
              <p className="text-muted-foreground">
                Practice interviews with customized questions based on your job applications.
              </p>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Inclusive Employers</h3>
              <p className="text-muted-foreground">
                Apply to jobs with companies committed to diversity and accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Find Your Perfect Job?
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of job seekers who have found meaningful employment through our platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/signup">Sign Up Now</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
