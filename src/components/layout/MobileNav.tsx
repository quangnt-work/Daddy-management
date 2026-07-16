import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import styles from './MobileNav.module.css';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface MobileNavProps {
  navItems: NavItem[];
}

const MobileNav = ({ navItems }: MobileNavProps) => {
  return (
    <nav className={styles.mobileNav}>
      <div className={styles.navContainer}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={24} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
