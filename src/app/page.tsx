import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <MainLayout>
      <section className="w-full min-h-screen flex items-center bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6 py-16 md:py-24">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl">
                  Bingo! Job Coach Platform
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                  A comprehensive job coaching platform designed for individuals with disabilities.
                  Find your perfect job match, connect with specialized coaches, and access resources
                  tailored to your needs.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg h-14 px-8">
                  <Link href="/assessment">Start Your Assessment</Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg h-14 px-8" asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-6"></div>
                <Image
                  src="/undraw_interview_yz52.svg"
                  alt="Interview illustration"
                  width={500}
                  height={500}
                  className="relative w-auto h-auto transform hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <div className="space-y-2 max-w-[800px]">
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our platform connects job seekers with disabilities to specialized coaches and
                employers who value diversity and inclusion.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="group relative flex flex-col items-center p-8 rounded-2xl bg-background hover:bg-primary/5 transition-colors duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Complete Assessment</h3>
              <p className="text-center text-muted-foreground text-lg leading-relaxed">
                Tell us about your skills, preferences, and accessibility needs.
              </p>
            </div>
            <div className="group relative flex flex-col items-center p-8 rounded-2xl bg-background hover:bg-primary/5 transition-colors duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Match with Coaches</h3>
              <p className="text-center text-muted-foreground text-lg leading-relaxed">
                Get paired with job coaches who specialize in your specific needs.
              </p>
            </div>
            <div className="group relative flex flex-col items-center p-8 rounded-2xl bg-background hover:bg-primary/5 transition-colors duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Find Your Job</h3>
              <p className="text-center text-muted-foreground text-lg leading-relaxed">
                Apply to jobs with employers committed to inclusive hiring practices.
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-16">
            <Button asChild size="lg" className="text-lg h-14 px-8">
              <Link href="/auth/signup">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-24 bg-gradient-to-b from-muted to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <div className="space-y-2 max-w-[800px]">
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">
                Features
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our platform is designed with accessibility at its core, offering a range of features
                to support your job search journey.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group flex flex-col p-8 rounded-2xl bg-background hover:bg-primary/5 transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-4">Personalized Job Matching</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                AI-powered job recommendations based on your skills and accessibility needs.
              </p>
            </div>
            <div className="group flex flex-col p-8 rounded-2xl bg-background hover:bg-primary/5 transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-4">Specialized Coaching</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Connect with coaches who understand your specific disabilities and challenges.
              </p>
            </div>
            <div className="group flex flex-col p-8 rounded-2xl bg-background hover:bg-primary/5 transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-4">Accessible Interface</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fully customizable accessibility options to meet your individual needs.
              </p>
            </div>
            <div className="group flex flex-col p-8 rounded-2xl bg-background hover:bg-primary/5 transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-4">Resume Builder</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Create professional resumes with our accessible tools and get AI-powered feedback.
              </p>
            </div>
            <div className="group flex flex-col p-8 rounded-2xl bg-background hover:bg-primary/5 transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-4">Interview Preparation</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Practice interviews with customized questions based on your job applications.
              </p>
            </div>
            <div className="group flex flex-col p-8 rounded-2xl bg-background hover:bg-primary/5 transition-colors duration-300">
              <h3 className="text-2xl font-bold mb-4">Inclusive Employers</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Apply to jobs with companies committed to diversity and accessibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-24 bg-gradient-to-b from-background to-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/5 [mask-image:linear-gradient(to_bottom,transparent,50%,black)]"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4 max-w-[800px]">
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">
                Ready to Find Your Perfect Job?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join thousands of job seekers who have found meaningful employment through our platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg h-14 px-8">
                <Link href="/auth/signup">Sign Up Now</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg h-14 px-8" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
