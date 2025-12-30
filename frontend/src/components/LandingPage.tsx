import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import { Blog } from "../types";

const LandingPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get<Blog[]>("/api/blogs");
        const published = res.data
          .filter(b => b.status === "published")
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 6);

        setBlogs(published);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLatest();
  }, []);

  return (
    <div className="w-full">

      <section className="bg-[linear-gradient(180deg,#c7ddff_0%,#ffffff_64%)] pt-24 pb-20">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            Write. Publish. Inspire.
          </h1>

          <p className="mt-5 text-lg text-slate-600">
            A calm, modern space for bloggers and readers to share ideas, stories, and knowledge.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/create-blog"
              className="bg-blue-600 text-white px-7 py-3 rounded-xl font-medium shadow hover:bg-blue-700 transition"
            >
              Start Writing
            </Link>

            <Link
              to="/all-blogs"
              className="bg-white border border-slate-200 text-slate-800 px-7 py-3 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition"
            >
              Explore Blogs
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Latest Blogs
            </h2>

            <Link
              to="/all-blogs"
              className="text-blue-600 font-medium hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map(blog => (
              <div
                key={blog._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {blog.imageUrl && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${blog.imageUrl}`}
                    alt={blog.title}
                    className="w-full h-44 object-cover"
                  />
                )}

                <div className="p-5 flex flex-col gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                    {blog.title}
                  </h3>

                  <div
                    className="text-sm text-slate-600 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />

                  <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>

                    <Link
                      to={`/blogs/${blog._id}`}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-6 text-center max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-900">
            Built for writers, loved by readers
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Write beautifully
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Distraction-free editor with autosave, drafts, and rich formatting.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Publish easily
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Share your stories with the world in one click.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Grow your audience
              </h3>
              <p className="mt-3 text-sm text-slate-600">
                Reach thousands of readers across topics and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900">
            Start your blogging journey today
          </h2>

          <p className="mt-4 text-slate-600">
            Share your ideas with the world.
          </p>

          <Link
            to="/create-blog"
            className="inline-block mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow hover:bg-blue-700 transition"
          >
            Start Writing Now
          </Link>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
