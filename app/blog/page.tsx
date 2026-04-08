import { blogPosts, faqs } from "@/lib/ecommerce";

export default function BlogPage() {
  return (
    <div className="space-y-10 pb-10">
      <section className="rounded-[2rem] border border-stone-200 bg-[linear-gradient(135deg,#faf7f2_0%,#eef6f0_100%)] px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-600">
          Blog / FAQ
        </p>
        <h1 className="mt-4 font-display text-5xl leading-none text-stone-950">
          Additional content for discovery and support
        </h1>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="rounded-[1.75rem] border border-stone-200 bg-white p-6"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
              {post.date}
            </p>
            <h2 className="mt-3 font-display text-3xl text-stone-950">
              {post.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-600">{post.excerpt}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-stone-50">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-400">
          FAQ
        </p>
        <div className="mt-6 space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-[1.25rem] border border-stone-800 bg-stone-900 p-4"
            >
              <h2 className="text-lg font-semibold">{faq.question}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
