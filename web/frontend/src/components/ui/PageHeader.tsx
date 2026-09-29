'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Badge } from './Badge';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  badgeVariant?: 'teal' | 'success' | 'warning' | 'error' | 'danger' | 'info' | 'neutral';
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  backUrl?: string;
  onBack?: () => void;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  subtitle,
  badge,
  badgeVariant = 'teal',
  actions,
  breadcrumbs,
  backHref,
  backUrl,
  onBack,
  icon,
  className = '',
}) => {
  const effectiveDescription = description ?? subtitle;
  const effectiveBackHref = backHref ?? backUrl;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (
      typeof icon === 'function' ||
      (typeof icon === 'object' && icon !== null && ('render' in (icon as any) || '$$typeof' in (icon as any)))
    ) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-5 h-5 text-teal-800" />;
    }
    return null;
  };
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-sans ${className}`}
    >
      <div className="space-y-1.5 min-w-0">
        {/* Breadcrumbs or Back Link */}
        {(breadcrumbs && breadcrumbs.length > 0) || effectiveBackHref || onBack ? (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1 flex-wrap">
            {effectiveBackHref && (
              <Link
                href={effectiveBackHref}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-teal-700 transition-colors mr-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>
            )}
            {onBack && !effectiveBackHref && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-teal-700 transition-colors mr-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            {breadcrumbs?.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-teal-700 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-slate-700 font-bold' : ''}>
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : null}

        {/* Badge / Indicator */}
        {badge && (
          <div className="flex items-center gap-2">
            {typeof badge === 'string' ? (
              <Badge variant={badgeVariant} size="sm">
                {badge}
              </Badge>
            ) : (
              badge
            )}
          </div>
        )}

        {/* Title & Icon */}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              {renderIcon()}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
            {title}
          </h1>
        </div>

        {/* Description */}
        {effectiveDescription && (
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-3xl leading-relaxed">
            {effectiveDescription}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
