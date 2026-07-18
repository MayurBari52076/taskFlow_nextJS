'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiCheckSquare,
  FiUsers,
  FiMessageCircle,
  FiPaperclip,
  FiBarChart2,
  FiGitBranch,
} from 'react-icons/fi';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import Navbar from '@/components/layout/Navbar';
import Braid from '@/components/landing/TaskStack';

const FEATURES = [
  {
    icon: FiCheckSquare,
    title: 'Tasks that hold their shape',
    text: 'Priority, due dates, tags, and status in one place — searchable by anything you typed, including buried subtasks.',
  },
  {
    icon: FiGitBranch,
    title: 'Subtasks, nested as deep as the work needs',
    text: "Break work down without a depth limit. Check one off and the parent's task progress updates on its own.",
  },
  {
    icon: FiUsers,
    title: 'Invite by email, not by guesswork',
    text: 'Send a secure link, set their role, and access opens the moment they accept — nothing shared until then.',
  },
  {
    icon: FiMessageCircle,
    title: 'A chat thread for every task',
    text: "Typing indicators, read receipts, and full history — so the conversation stays with the work it's about.",
  },
  {
    icon: FiPaperclip,
    title: 'Files that live next to the task',
    text: 'Drop in images, PDFs, docs, or zips. Everyone with access can preview and download instantly.',
  },
  {
    icon: FiBarChart2,
    title: 'See where the week actually went',
    text: 'Completion trends and priority breakdowns, pulled from what your team already logged — no extra step.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: 'easeOut',
    },
  }),
};

export default function HomePage() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section
        id="home"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '96px 48px 64px',
          display: 'flex',
          alignItems: 'center',
          gap: '48px',
          flexWrap: 'wrap',
        }}
      >
        <motion.div
          style={{ flex: '1 1 420px' }}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            For teams juggling too many threads
          </span>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: '16px 0 20px',
            }}
          >
            Where scattered work
            <br />
            finds its thread.
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              maxWidth: '480px',
              marginBottom: '32px',
            }}
          >
            Tasks, subtasks, chat, and files — usually four separate tabs —
            collected into one place your team actually keeps open.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/register"
              style={{
                padding: '14px 28px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent)',
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Get started free
            </Link>

            <a
              href="#features"
              style={{
                padding: '14px 28px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              See how it works
            </a>
          </div>
        </motion.div>

        <motion.div
          style={{
            flex: '1 1 320px',
            maxWidth: '420px',
            margin: '0 auto',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
          }}
        >
          <Braid />
        </motion.div>
      </section>
            {/* Features */}
      <section
        id="features"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '64px 48px',
        }}
      >
        <motion.h2
          style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            marginBottom: '8px',
            textAlign: 'center',
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          Everything your team scattered, in one place
        </motion.h2>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-secondary)',
            maxWidth: '520px',
            margin: '0 auto 40px',
          }}
        >
          Built for the work that doesn't fit in a single checklist.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass-surface"
              style={{ padding: '24px' }}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                }}
              >
                <feature.icon
                  size={18}
                  color="var(--accent)"
                />
              </div>

              <h3
                style={{
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  marginBottom: '6px',
                }}
              >
                {feature.title}
              </h3>

              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {feature.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
            {/* About */}
      <section
        id="about"
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: '64px 48px',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            Why TaskFlow exists
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            Most task tools handle the list. Few handle what happens around it
            — the quick question in chat, the file someone meant to attach three
            edits ago, the subtask nobody remembers assigning. TaskFlow keeps
            all of that with the task it belongs to, so context never has to be
            reconstructed from five different apps.
          </p>
        </motion.div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '64px 48px',
          textAlign: 'center',
        }}
      >
        <motion.div
          className="glass-surface"
          style={{ padding: '40px' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            Questions before you sign up?
          </h2>

          <p
            style={{
              color: 'var(--text-secondary)',
              marginBottom: '20px',
            }}
          >
            Reach us any time — a person reads every message.
          </p>

          <a
            href="mailto:hello@taskflow.app"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)',
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            hello@taskflow.app
          </a>
        </motion.div>
      </section>
            {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '32px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <span style={{ fontWeight: 700 }}>
          TaskFlow
        </span>

        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          © {new Date().getFullYear()} TaskFlow. All rights reserved.
        </span>

        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub size={18} />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <FaTwitter size={18} />
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={18} />
          </a>
        </div>
      </footer>
    </div>
  );
}