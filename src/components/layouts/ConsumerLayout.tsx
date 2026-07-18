import React from 'react';
import { colors, spacing, typography } from '../../design-system/tokens';

interface ConsumerLayoutProps {
  children: React.ReactNode;
}

const ConsumerLayout = ({ children }: ConsumerLayoutProps) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: colors.neutral[50],
  };

  const navbarStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderBottom: `1px solid ${colors.neutral[200]}`,
    padding: `${spacing.lg} ${spacing.xl}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: typography.family.display,
    color: colors.primary[500],
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const navLinksStyles: React.CSSProperties = {
    display: 'flex',
    gap: spacing.xl,
    alignItems: 'center',
  };

  const navLinkStyles: React.CSSProperties = {
    color: colors.ink.primary,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 150ms ease-in-out',
  };

  const ctaButtonStyles: React.CSSProperties = {
    backgroundColor: colors.primary[500],
    color: '#ffffff',
    border: 'none',
    padding: `${spacing.md} ${spacing.xl}`,
    borderRadius: '9px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'background-color 150ms ease-in-out',
  };

  const mainStyles: React.CSSProperties = {
    flex: 1,
  };

  const footerStyles: React.CSSProperties = {
    backgroundColor: colors.ink.primary,
    color: '#ffffff',
    padding: `${spacing.xl} ${spacing.xl}`,
    marginTop: spacing.xl,
  };

  const footerGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  };

  const footerSectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  };

  const footerLinkStyles: React.CSSProperties = {
    color: colors.neutral[300],
    textDecoration: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'color 150ms ease-in-out',
  };

  const footerBottomStyles: React.CSSProperties = {
    borderTop: `1px solid ${colors.neutral[700]}`,
    paddingTop: spacing.lg,
    textAlign: 'center',
    fontSize: '12px',
    color: colors.neutral[400],
  };

  return (
    <div style={containerStyles}>
      {/* Navbar */}
      <header style={navbarStyles}>
        <a href="/" style={logoStyles}>
          🚗 AutoSuite
        </a>
        <nav style={navLinksStyles}>
          <a href="/pages/cars.html" style={navLinkStyles}>
            Inventory
          </a>
          <a href="/" style={navLinkStyles}>
            Financing
          </a>
          <a href="/" style={navLinkStyles}>
            Trade-In
          </a>
          <button style={ctaButtonStyles}>Book Test Drive</button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={mainStyles}>{children}</main>

      {/* Footer */}
      <footer style={footerStyles}>
        <div style={footerGridStyles}>
          <div style={footerSectionStyles}>
            <strong style={{ fontSize: '14px' }}>AutoSuite</strong>
            <a href="/" style={footerLinkStyles}>
              About Us
            </a>
            <a href="/" style={footerLinkStyles}>
              Contact
            </a>
            <a href="/" style={footerLinkStyles}>
              Support
            </a>
          </div>
          <div style={footerSectionStyles}>
            <strong style={{ fontSize: '14px' }}>For Dealers</strong>
            <a href="/pages/dashboard.html" style={footerLinkStyles}>
              Dashboard
            </a>
            <a href="/pages/crm.html" style={footerLinkStyles}>
              CRM
            </a>
            <a href="/" style={footerLinkStyles}>
              Pricing
            </a>
          </div>
          <div style={footerSectionStyles}>
            <strong style={{ fontSize: '14px' }}>Legal</strong>
            <a href="/" style={footerLinkStyles}>
              Privacy
            </a>
            <a href="/" style={footerLinkStyles}>
              Terms
            </a>
            <a href="/" style={footerLinkStyles}>
              Cookies
            </a>
          </div>
        </div>
        <div style={footerBottomStyles}>
          © 2024 AutoSuite. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ConsumerLayout;
