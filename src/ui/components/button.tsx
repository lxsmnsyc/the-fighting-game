import { type JSX, splitProps } from 'solid-js';

export type ButtonVariant = 'primary' | 'secondary';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-500',
  secondary: 'bg-zinc-800 ring-1 ring-zinc-600 hover:bg-zinc-700',
};

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button(props: ButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['variant', 'class']);
  return (
    <button
      type="button"
      {...rest}
      class={`rounded-lg px-5 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[local.variant ?? 'secondary']} ${local.class ?? ''}`}
    />
  );
}
