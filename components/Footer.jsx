import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/80 mt-8 bg-white">
      <div className="container-max py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h3 className="font-semibold mb-3">News</h3>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/">Home Page</Link></li>
            <li><Link href="/local">Local News</Link></li>
            <li><Link href="/blindspot">Blindspot Feed</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Help</h3>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/frequently-asked-questions">FAQ</Link></li>
            <li><Link href="/contact-us">Contact</Link></li>
            <li><Link href="/rating-system">Media Bias Ratings</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Tools</h3>
          <ul className="space-y-2 text-gray-600">
            <li><Link href="/app">App</Link></li>
            <li><Link href="/extension">Browser Extension</Link></li>
            <li><Link href="/newsletters/daily-ground">Daily Newsletter</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200/80">
        <div className="container-max py-4 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/duck-wire-logo.png" alt="DuckWire" className="h-5 w-auto" />
            <span>© {new Date().getFullYear()} DuckWire</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-and-conditions">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
