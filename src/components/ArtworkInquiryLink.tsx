type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export function ArtworkInquiryLink({ href, className, children }: Props) {
  if (href === "#") {
    return (
      <span className={className} aria-disabled>
        {children}
      </span>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
