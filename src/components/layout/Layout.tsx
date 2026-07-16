import { Outlet, NavLink } from 'react-router-dom';
import { Home, Calendar, Users, History } from 'lucide-react';
import styles from './Layout.module.css';
import MobileNav from './MobileNav';

const navItems = [
  { path: '/', label: 'Tổng quan', icon: Home },
  { path: '/schedule', label: 'Lịch thi đấu', icon: Calendar },
  { path: '/squad', label: 'Đội hình', icon: Users },
  { path: '/history', label: 'Lịch sử đấu', icon: History },
];

const Layout = () => {
  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>FC DADDY</div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav navItems={navItems} />
    </div>
  );
};

export default Layout;
