import { Link } from 'react-router-dom';
import { PaperPlane } from './StoryPrimitives';

const productLinks = [
  ['Features', '#features'],
  ['How it works', '#how-it-works'],
];

const companyLabels = ['About', 'Team', 'Blog'];
const legalLabels = ['Privacy', 'Terms', 'Contact'];

function SocialMark({ type }: { type: 'github' | 'linkedin' | 'youtube' | 'twitter' }) {
  if (type === 'linkedin') {
    return <svg viewBox="0 0 24 24"><path d="M5.2 8.2H2V22h3.2V8.2ZM3.6 2A2 2 0 1 0 3.6 6a2 2 0 0 0 0-4ZM22 14.1c0-4.2-2.2-6.2-5.2-6.2-2.4 0-3.5 1.3-4.1 2.3v-2H9.5V22h3.2v-6.8c0-1.8.3-3.6 2.6-3.6 2.2 0 2.3 2.1 2.3 3.8V22H22v-7.9Z" /></svg>;
  }
  if (type === 'youtube') {
    return <svg viewBox="0 0 24 24"><path d="M23.4 6.2a3 3 0 0 0-2.1-2.1C19.4 3.6 12 3.6 12 3.6s-7.4 0-9.3.5A3 3 0 0 0 .6 6.2C.1 8.1.1 12 .1 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" /></svg>;
  }
  if (type === 'twitter') {
    return <svg viewBox="0 0 24 24"><path d="M23.5 4.8a9.4 9.4 0 0 1-2.7.7 4.7 4.7 0 0 0 2.1-2.6 9.4 9.4 0 0 1-3 1.1A4.7 4.7 0 0 0 11.8 7a13.4 13.4 0 0 1-9.7-4.9 4.7 4.7 0 0 0 1.5 6.3 4.7 4.7 0 0 1-2.1-.6v.1a4.7 4.7 0 0 0 3.8 4.6 4.8 4.8 0 0 1-2.1.1 4.7 4.7 0 0 0 4.4 3.3A9.5 9.5 0 0 1 1.7 18H.6a13.3 13.3 0 0 0 7.2 2.1c8.7 0 13.4-7.2 13.4-13.4v-.6a9.5 9.5 0 0 0 2.3-2.4v1.1Z" /></svg>;
  }
  return <svg viewBox="0 0 24 24"><path d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.2.8-.5v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.4-5.5-6a4.7 4.7 0 0 1 1.2-3.2c-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2a4.7 4.7 0 0 1 1.2 3.2c0 4.6-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.4 11.4 0 0 0 12 .8Z" /></svg>;
}

function FooterPlant({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 250 310" fill="none" aria-hidden="true">
      <path className="footer-plant-stem" d="M62 310c4-82 30-158 102-241M94 218c14-38 17-79 8-117M112 180c37-27 62-57 74-91M70 265c39-23 67-52 85-87" />
      <g className="footer-plant-leaves">
        <path d="M92 220C51 218 32 196 29 161c38-1 61 17 63 59Z" />
        <path d="M108 180c-8-39 8-66 42-80 13 35-1 64-42 80Z" />
        <path d="M100 137c-34-10-49-34-44-66 33 6 50 29 44 66Z" />
        <path d="M141 123c1-38 20-59 55-64 3 34-15 58-55 64Z" />
        <path d="M153 83c-4-29 8-50 34-61 10 27-1 49-34 61Z" />
        <path d="M74 270c-35 1-58-15-69-46 33-7 58 9 69 46Z" />
        <path d="M76 267c14-36 40-52 76-46-9 35-35 52-76 46Z" />
      </g>
      <g className="footer-leaf-veins">
        <path d="m37 169 48 43m62-102-34 61m-49-90 31 48m92-61-39 47m35-81-26 42M14 231l53 32m76-35-60 34" />
      </g>
    </svg>
  );
}

function FooterDeskScene() {
  return (
    <svg className="story-footer-desk" viewBox="0 0 430 270" fill="none" aria-hidden="true">
      <ellipse className="footer-desk-shadow" cx="235" cy="249" rx="183" ry="15" />
      <g className="footer-books">
        <path d="M43 203h216l-9 34H35c-10-8-7-25 8-34Z" />
        <path d="M54 173h216l-9 31H46c-9-7-6-22 8-31Z" />
        <path d="M83 139h185l9 34H74c-10-8-6-26 9-34Z" />
        <path className="footer-book-pages" d="M53 211h187m-177-29h190m-160-34h165" />
        <path className="footer-book-detail" d="m71 203-5 34m23-64-4 30m27-64 7 34" />
      </g>
      <g className="footer-pot">
        <path d="M321 146h79l-9 103h-61l-9-103Z" />
        <ellipse cx="360" cy="146" rx="42" ry="10" />
        <path d="M330 157c19 7 41 7 61 0" />
      </g>
      <g className="footer-desk-plant">
        <path d="M360 144c0-55 3-94 15-130M359 118c-20-37-39-58-67-76m69 58c24-30 41-50 64-60m-67 36c-17-28-28-47-52-61" />
        <path d="M295 43c21-5 38 3 49 25-23 6-40-2-49-25Zm76 10c-4-24 4-41 26-51 7 22-2 39-26 51Zm28 20c8-24 24-36 48-34-5 23-21 35-48 34Zm-94-55c20-8 37-3 51 16-20 10-38 4-51-16Zm40 84c-23 1-38-10-46-31 22-4 38 7 46 31Zm20 7c3-24 16-39 39-45 0 23-13 39-39 45Z" />
      </g>
    </svg>
  );
}

export function LandingFooter() {
  return (
    <footer className="konek-story story-footer">
      <svg className="story-footer-flight-path" viewBox="0 0 900 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M5 82c165-87 259-65 296-18 32 40 108 36 188-2 73-34 145-52 196-39 39 10 8 53 55 58 34 4 53-9 75-22" />
      </svg>
      <PaperPlane className="story-footer-plane" />
      <FooterPlant className="story-footer-plant story-footer-plant-left" />
      <FooterDeskScene />

      <div className="story-footer-shell">
        <div className="story-footer-main">
          <div className="story-footer-brand">
            <Link className="story-footer-wordmark" to="/" aria-label="KONEK home">KONEK</Link>
            <p>Turn your CV into<br />career direction.</p>
            <div className="story-footer-socials" aria-hidden="true">
              <span><SocialMark type="github" /></span><span><SocialMark type="linkedin" /></span><span><SocialMark type="youtube" /></span><span><SocialMark type="twitter" /></span>
            </div>
          </div>

          <nav className="story-footer-nav" aria-label="Footer navigation">
            <div className="story-footer-column">
              <h2>Product</h2>
              {productLinks.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
            </div>
            <div className="story-footer-column">
              <h2>Company</h2>
              {companyLabels.map(label => <span key={label}>{label}</span>)}
            </div>
            <div className="story-footer-column">
              <h2>Resources</h2>
              <a href="#case-studies">Job Matching</a>
              <a href="#features">CV Analysis</a>
              <Link to="/cv">Upload your CV</Link>
            </div>
            <div className="story-footer-column">
              <h2>Legal</h2>
              {legalLabels.map(label => <span key={label}>{label}</span>)}
            </div>
          </nav>
        </div>
        <div className="story-footer-bottom">
          <p>© {new Date().getFullYear()} KONEK. All rights reserved.</p>
          <div className="story-footer-access">
            <Link to="/login">Sign in</Link>
            <Link to="/register">Create account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
