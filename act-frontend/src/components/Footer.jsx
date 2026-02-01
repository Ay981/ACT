import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="bg-[#0f4c75] dark:bg-card dark:border-t dark:border-border text-white dark:text-muted-foreground pt-12 pb-4 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Column 1: About Us */}
        <div>
          <h3 className="text-lg font-bold mb-4 dark:text-foreground">About Us</h3>
          <p className="text-sm leading-relaxed mb-4 text-blue-100 dark:text-muted-foreground">
            ACT Academy platform that connects Teachers with Students globally. Teachers create high-quality courses and present them in a super easy way.
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/ACTAmericanCollege/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
              <FacebookIcon className="w-6 h-6" />
            </a>
            <a href="https://www.linkedin.com/company/sholla-computing/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
              <LinkedinIcon className="w-6 h-6" />
            </a>
            <a href="https://www.youtube.com/channel/UCvMF1rHwmOS7n553hSMzEBQ" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
              <YoutubeIcon className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Column 2: Contact */}
        <div>
          <h3 className="text-lg font-bold mb-4 dark:text-foreground">Contact</h3>
          <div className="space-y-3 text-sm text-blue-100 dark:text-muted-foreground">
            <p>ACT American College of Technology Building, Arada Sub-city, Addis Ababa, Ethiopia</p>
            <p>Telephone: 251-956-820-619</p>
            <p>academy@act.edu.et</p>
          </div>
        </div>

        {/* Column 3: Links 1 */}
        <div>
           <ul className="space-y-2 text-sm text-blue-100 dark:text-muted-foreground">
             <li><Link to="/" className="hover:text-white dark:hover:text-foreground hover:underline">Home</Link></li>
             <li><Link to="/dashboard" className="hover:text-white dark:hover:text-foreground hover:underline">Dashboard</Link></li>
             <li><Link to="/courses" className="hover:text-white dark:hover:text-foreground hover:underline">Popular Courses</Link></li>
             <li><Link to="/courses" className="hover:text-white dark:hover:text-foreground hover:underline">Courses</Link></li>
             <li><Link to="/courses" className="hover:text-white dark:hover:text-foreground hover:underline">Featured Courses</Link></li>
             {!user && (
               <li><Link to="/signup" className="hover:text-white dark:hover:text-foreground hover:underline">Sign Up</Link></li>
             )}
           </ul>
        </div>

        {/* Column 4: Links 2 */}
        <div>
           <ul className="space-y-2 text-sm text-blue-100">
             <li><a href="#" className="hover:text-white hover:underline">Blog</a></li>
             <li><a href="#" className="hover:text-white hover:underline">About Us</a></li>
             <li><a href="#" className="hover:text-white hover:underline">Terms of use</a></li>
             <li><a href="#" className="hover:text-white hover:underline">Privacy Policy & Cookie Policy</a></li>
           </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 border-t border-blue-400/30 flex flex-col md:flex-row justify-between items-center gap-4">
         <p className="text-sm text-blue-200">Copyright © 2026 ACT Academy. All rights reserved.</p>
         
         <div>
            <select className="bg-white text-slate-800 dark:bg-background dark:text-foreground dark:border dark:border-input text-sm py-1 px-3 rounded shadow focus:outline-none">
                <option value="en">English</option>
                <option value="am">Amharic</option>
            </select>
         </div>
      </div>
    </footer>
  );
}

// Icons
function FacebookIcon(props) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.747-2.971 2.225v1.747h5.095l-.641 3.667h-4.454v7.98H9.101Z" />
    </svg>
  );
}

function LinkedinIcon(props) {
    return (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
             <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
    )
}

function YoutubeIcon(props) {
    return (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
    )
}
