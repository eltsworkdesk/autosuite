import React from 'react';
import { colors, spacing, typography, zIndex } from '../../design-system/tokens';

interface DealerLayoutProps {
  children: React.ReactNode;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const DealerLayout = ({ children, sidebarOpen = true, onToggleSidebar }: DealerLayoutProps) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: colors.neutral[50],
  };

  const sidebarStyles: React.CSSProperties = {
    width: '280px',
    backgroundColor: colors.ink.primary,
    color: '#ffffff',
    padding: spacing.xl,
    overflow: 'auto',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: zIndex.sticky,
    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 250ms ease-in-out',
  };

  const sidebarContentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: typography.family.display,
    marginBottom: spacing.lg,
  };

  const navStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    flex: 1,
  };

  const navItemStyles: React.CSSProperties = {
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'background-color 150ms ease-in-out',
    color: colors.neutral[300],
  };

  const mainContentStyles: React.CSSProperties = {
    marginLeft: sidebarOpen ? '280px' : '0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'margin-left 250ms ease-in-out',
  };

  const topBarStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderBottom: `1px solid ${colors.neutral[200]}`,
    padding: `${spacing.lg} ${spacing.xl}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    boxShadow: colors.neutral[200],
  };

  const toggleButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: colors.ink.primary,
    padding: spacing.md,
  };

  const contentAreaStyles: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: spacing.xl,
  };

  return (
    <div style={containerStyles}>
      {/* Sidebar */}
      <nav style={sidebarStyles}>
        <div style={sidebarContentStyles}>
          <div style={logoStyles}>🚗 AutoSuite</div>
          <div style={navStyles}>
            <div style={{ ...navItemStyles, backgroundColor: colors.primary[500], color: '#ffffff' }}>
              📊 Overview
            </div>
            <div style={navItemStyles}>📋 CRM</div>
            <div style={navItemStyles}>🛞 Inventory</div>
            <div style={navItemStyles}>📅 Appointments</div>
            <div style={navItemStyles}>👥 Customers</div>
            <div style={navItemStyles}>📈 Analytics</div>
            <div style={navItemStyles}>👤 Staff</div>
            <div style={navItemStyles}>⚙️ Settings</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={mainContentStyles}>
        {/* Top Bar */}
        <header style={topBarStyles}>
          <button style={toggleButtonStyles} onClick={onToggleSidebar} aria-label="Toggle sidebar">
            ☰
          </button>
          <div style={{ fontSize: '14px', color: colors.ink.tertiary }}>
            👤 Admin User
          </div>
        </header>

        {/* Content Area */}
        <main style={contentAreaStyles}>{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: zIndex.overlay,
            display: 'none',
          }}
          onClick={onToggleSidebar}
        />
      )}
    </div>
  );
};

export default DealerLayout;
