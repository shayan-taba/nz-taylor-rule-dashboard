// src/components/ui/SimpleIcon.tsx

type Props = {
  icon: { svg: string };
  size?: number;
};

export function SimpleIcon({ icon, size = 16 }: Props) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      dangerouslySetInnerHTML={{ __html: icon.svg }}
    />
  );
}