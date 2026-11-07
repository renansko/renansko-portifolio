import { useInView } from '../hooks/useReveal.js';

/** Wrapper com animação de entrada (.reveal → .reveal.in) ao rolar a página. */
export default function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  const [ref, visible] = useInView();
  const classes = ['reveal', visible && 'in', className].filter(Boolean).join(' ');
  return (
    <Tag ref={ref} className={classes} {...props}>
      {children}
    </Tag>
  );
}
