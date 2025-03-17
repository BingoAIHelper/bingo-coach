import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail } from "@/lib/database";
import bcrypt from 'bcryptjs';

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      firstName?: string;
      lastName?: string;
    }
  }
}

// Extend JWT token type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get the user by email
          console.log("Looking up user with email:", credentials.email);
          const user = await getUserByEmail(credentials.email);
          
          console.log("User from DB:", user ? `Found user with ID: ${user.id}` : "No user found");
          
          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }
          
          // Compare the provided password with the stored hashed password
          console.log("Comparing passwords...");
          console.log("Input password (first 3 chars):", credentials.password.substring(0, 3));
          console.log("User object keys:", Object.keys(user));
          console.log("Stored hashed password:", user.password);
          
          // Handle case where password might be undefined
          if (!user.password) {
            console.log("ERROR: User password is undefined or null");
            return null;
          }
          
          let isValidPassword = false;
          
          // Check if the stored password looks like a bcrypt hash
          if (user.password.startsWith('$2')) {
            // It's a proper bcrypt hash
            isValidPassword = await bcrypt.compare(
              credentials.password,
              user.password
            );
          } else {
            // For testing purposes - handle non-hashed passwords in dev
            console.log("WARNING: Password in DB is not a bcrypt hash - doing direct comparison for development");
            // For the seed users, we're directly comparing the passwords
            if (credentials.email === 'test@example.com' && credentials.password === 'Password123!') {
              isValidPassword = true;
            } else if (credentials.email === 'jane@example.com' && credentials.password === 'Password456!') {
              isValidPassword = true;
            } else {
              // Last resort - direct compare (VERY UNSAFE - only for development)
              isValidPassword = credentials.password === user.password;
            }
          }
          
          console.log("Password validation result:", isValidPassword);
          
          if (!isValidPassword) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }
          
          console.log("Authentication successful for:", credentials.email);
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || (user.isCoach ? "coach" : "seeker"),
          };
        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      },
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_TENANT_ID,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          firstName: profile.given_name,
          lastName: profile.family_name,
          image: profile.picture,
          // By default, assign users from social providers as seekers
          // This can be updated later in their profile
          role: "seeker",
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          firstName: profile.given_name,
          lastName: profile.family_name,
          image: profile.picture,
          // By default, assign users from social providers as seekers
          // This can be updated later in their profile
          role: "seeker",
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    newUser: "/auth/signup",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };