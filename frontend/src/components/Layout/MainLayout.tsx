import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  BoxesIcon,
  Map,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Tags
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../context/ToastContext';
import { NavigationItem } from '../../types';

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { user, signOut } = useAuth();
  const { toasts, removeToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: <BoxesIcon className="w-5 h-5" />,
    },
    {
      name: 'Products',
      path: '/products',
      icon: <Package className="w-5 h-5" />,
    },
    {
      name: 'Product Types',
      path: '/product-types',
      icon: <Tags className="w-5 h-5" />,
    },
    {
      name: 'Locations',
      path: '/locations',
      icon: <Map className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="flex h-screen">
        {/* Sidebar - Desktop */}
        <div
          className={`fixed lg:static w-64 bg-[#445372] text-white transition-all duration-300 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 z-30 flex flex-col h-full`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#384560] flex-shrink-0">
            <h1 className="text-xl font-bold">Inventory Control</h1>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded-md hover:bg-[#384560]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="py-4">
              <ul className="space-y-1 px-2">
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className={`flex items-center justify-between w-full px-4 py-2 text-left rounded-md hover:bg-[#384560] ${
                            expandedItems.includes(item.name) ? 'bg-[#384560]' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            {item.icon}
                            <span className="ml-3">{item.name}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              expandedItems.includes(item.name) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {expandedItems.includes(item.name) && (
                          <ul className="pl-10 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <li key={child.name}>
                                <a
                                  href={child.path}
                                  className={`block px-4 py-2 rounded-md hover:bg-[#384560] ${
                                    location.pathname === child.path ? 'bg-[#384560]' : ''
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(child.path);
                                    setIsMobileMenuOpen(false);
                                  }}
                                >
                                  {child.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <a
                        href={item.path}
                        className={`flex items-center px-4 py-2 rounded-md hover:bg-[#384560] ${
                          location.pathname === item.path ? 'bg-[#384560]' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* User Section */}
          <div className="px-4 py-4 border-t border-[#384560] bg-[#445372] flex-shrink-0">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#00859e] flex items-center justify-center text-white">
                {user?.display_name ? user.display_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <div className="ml-3 min-w-0">
                <p className="font-medium truncate">{user?.display_name || 'User'}</p>
                <p className="text-sm text-gray-300 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-left rounded-md hover:bg-[#384560] transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Sign Out</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-[#384560] bg-[#384560] flex-shrink-0">
            <div className="text-sm text-gray-400">
              <p className="text-center">© 2024 Inventory Control</p>
              <div className="flex justify-center space-x-4 text-xs mt-1">
                <a href="#" className="hover:text-gray-300">Support</a>
                <a href="#" className="hover:text-gray-300">Privacy</a>
                <a href="#" className="hover:text-gray-300">Terms</a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-0' : ''
        }`}>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-20">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="ml-4 flex-1">
              <h2 className="text-lg font-semibold text-gray-800">Welcome back, {user?.display_name || 'User'}</h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Add notification, profile buttons, etc. here */}
            </div>
          </header>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-10 bg-black bg-opacity-50 lg:hidden"
              onClick={toggleMobileMenu}
            ></div>
          )}

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};