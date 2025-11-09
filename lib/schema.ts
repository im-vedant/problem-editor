import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  serial,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  profileCompleted: boolean("profile_completed").notNull().default(false),
  image: text("image"),
  bio: text("bio"),
  gender: text("gender"),
  location: text("location"),
  country: text("country"),
  birthday: text("birthday"),
  website: text("website"),
  github: text("github"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
  college: text("college"),
  workExperience: text("work_experience"),
  skills: text("skills"),
  totalPoints: integer("total_points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

export const submission = pgTable("submission", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  problemId: text("problem_id").notNull(),
  status: text("status").notNull(),
  testsPassed: integer("tests_passed").notNull().default(0),
  totalTests: integer("total_tests").notNull().default(0),
  difficulty: text("difficulty").notNull(),
  score: integer("score"),
  type: text("type").notNull().default("code"),
  userSubmission: text("user_submission"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSolvedProblems = pgTable(
  "user_solved_problems",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    problemId: text("problem_id").notNull(),
    pointsAwarded: integer("points_awarded").notNull(),
    solvedAt: timestamp("solved_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueUserProblem: uniqueIndex("unique_user_problem").on(
      table.userId,
      table.problemId
    ),
  })
);

export const problem = pgTable("problem", {
  id: text("id").primaryKey(), // slug like 'metrics-f1-micro'
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  examples: text("examples").notNull().default("[]"), // JSON string array
  requirements: text("requirements").notNull().default(""),
  theory: text("theory").notNull().default(""),
  hints: text("hints").notNull().default("[]"), // JSON string array
  constraints: text("constraints").notNull().default(""),
  runnerTemplate: text("runner_template").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const implementationAnalytics = pgTable("implementation_analytics", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  problemId: text("problem_id").notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schema = {
  user,
  session,
  account,
  verification,
  submission,
  userSolvedProblems,
  problem,
  implementationAnalytics,
};
