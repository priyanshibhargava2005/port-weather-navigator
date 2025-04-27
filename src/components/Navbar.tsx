
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor, BarChart3, AlertCircle, Map, Compass, Ship } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <Compass className="w-5 h-5 mr-2" /> },
    // { name: 'Analytics', path: '/analytics', icon: <BarChart3 className="w-5 h-5 mr-2" /> },
    { name: 'Predictions', path: '/predictions', icon: <Ship className="w-5 h-5 mr-2" /> },
  ];

  return (
    <nav className="bg-white border-b border-maritime-100 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Anchor className="h-8 w-8 text-maritime-600" />
              <span className="ml-2 text-xl font-bold text-maritime-800">
                PortWeather
                <span className="text-ocean-600">Navigator</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-maritime-50 text-maritime-700'
                    : 'text-gray-600 hover:bg-maritime-50 hover:text-maritime-700'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-maritime-600 hover:bg-maritime-50 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu open/close */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-maritime-100`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === link.path
                  ? 'bg-maritime-50 text-maritime-700'
                  : 'text-gray-600 hover:bg-maritime-50 hover:text-maritime-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          
          <button className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-maritime-50 hover:text-maritime-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Alerts</span>
            <span className="ml-2 bg-red-500 text-white rounded-full text-xs px-1.5">3</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
