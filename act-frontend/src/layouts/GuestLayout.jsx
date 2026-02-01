import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function GuestLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background flex flex-col">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col justify-center">
        {children}
      </main>
      <Footer />
    </div>
  )
}
