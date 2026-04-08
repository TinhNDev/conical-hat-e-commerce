import Link from "next/link";
import { teamMembers } from "@/lib/ecommerce";

export default function AboutPage() {
  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
          About
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Team, roles, and student information
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-700">
          This page covers the checklist requirement for team member information,
          MSSV, roles, and GitHub profile links.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {teamMembers.map((member) => (
          <article
            key={member.studentId}
            className="rounded-[1.75rem] border border-stone-200 bg-white p-6"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
              {member.role}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-950">
              {member.name}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{member.studentId}</p>
            <Link
              href={member.github}
              className="mt-5 inline-flex text-sm font-medium text-stone-950 underline"
            >
              GitHub profile
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
