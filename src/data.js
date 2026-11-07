// Conteúdo estruturado do portfólio. Textos traduzíveis referenciam chaves de i18n.js.

export const CV_URL = 'uploads/Curriculo_2026.pdf';
export const EMAIL = 'renansko@gmail.com';
export const PHONE = '+5541999088675';
export const PHONE_LABEL = '+55 (41) 99908-8675';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/renan-skonicezny-vilela/';
export const GITHUB_URL = 'https://github.com/renansko';

export const NAV_ITEMS = [
  { href: '#about', idx: '01', key: 'nav_about' },
  { href: '#skills', idx: '02', key: 'nav_skills' },
  { href: '#experience', idx: '03', key: 'nav_experience' },
  { href: '#projects', idx: '04', key: 'nav_projects' },
  { href: '#contact', idx: '05', key: 'nav_contact' },
];

export const STATS = [
  { prefix: '', target: 50, unit: 'M+', key: 'stat_1' },
  { prefix: '-', target: 91, unit: '%', key: 'stat_2' },
  { prefix: '', target: 0, unit: ' bugs', key: 'stat_3' },
  { prefix: '', target: 4, unit: '+', key: 'stat_4' },
];

export const MARQUEE = [
  'LARAVEL', 'AI AGENTS', 'AWS', 'VUE 3', 'NUXT', 'POSTGRESQL', 'RABBITMQ', 'LLMS & RAG', 'TERRAFORM',
  'DOCKER', 'TYPESCRIPT', 'NODE.JS', 'PYTHON', 'RUST', 'OPEN FINANCE', 'DDD', 'TDD',
];

export const INFO_ROWS = [
  { k: 'info_k_post', v: 'IA Aplicada · UFPR (2025/2026)' },
  { k: 'info_k_edu', v: 'Eng. Computação · UFPR (2020/2024)' },
  { k: 'info_k_tec', v: 'Técnico Químico · SENAI (2018/2019)' },
  { k: 'info_k_loc', v: 'Curitiba · PR · Brasil' },
  { k: 'info_k_lang', v: 'PT (nativo) · EN (avançado) · ES (básico)' },
  { k: 'info_k_foc', vKey: 'info_v_foc' },
  { k: 'info_k_ava', vKey: 'info_v_ava' },
];

export const SKILLS = [
  {
    key: 'cat_backend',
    items: [
      ['PHP / Laravel', 'ADV', 95], ['Node.js / TypeScript', 'ADV', 90], ['Python', 'INT', 80],
      ['C# / .NET', 'INT', 70], ['Rust', 'BAS', 50],
    ],
  },
  {
    key: 'cat_ai',
    items: [
      ['LLMs & AI Agents', 'ADV', 90], ['RAG & Context Loops', 'ADV', 85], ['Prompt Engineering', 'ADV', 90],
      ['Confidence / Self-eval', 'ADV', 85], ['AI Applied (UFPR)', 'ADV', 80],
    ],
  },
  {
    key: 'cat_front',
    items: [
      ['Vue 3 / Nuxt', 'ADV', 85], ['React / Next.js', 'INT', 75], ['Flutter', 'INT', 70],
      ['HTML5 / CSS3 / Tailwind', 'ADV', 95],
    ],
  },
  {
    key: 'cat_cloud',
    items: [
      ['AWS (ECS, RDS, S3, Lambda)', 'INT', 80], ['Terraform (IaC)', 'INT', 75], ['Docker / Contêineres', 'ADV', 85],
      ['Vultr / Cloudflare / NGINX', 'ADV', 80], ['CI/CD (GitHub Actions, Azure)', 'ADV', 80],
    ],
  },
  {
    key: 'cat_data',
    items: [
      ['PostgreSQL / MySQL', 'ADV', 95], ['Redis & Caching', 'ADV', 85], ['RabbitMQ & Queues', 'ADV', 85],
      ['DynamoDB', 'INT', 70], ['WebSockets / Reverb / Socket.io', 'ADV', 85],
    ],
  },
  {
    key: 'cat_arch',
    items: [
      ['DDD & Clean Architecture', 'ADV', 90], ['SOLID & Design Patterns', 'ADV', 90],
      ['TDD / PHPUnit / PEST / Jest', 'ADV', 85], ['Open Finance / BACEN', 'ADV', 85],
      ['APIs REST & Microsserviços', 'ADV', 90],
    ],
  },
];

export const EXPERIENCE = [
  {
    start: '04/2025', current: true, roleKey: 'role_fullstack_lead', company: 'E-inov / Cnpj Biz', descKey: 'exp1',
    tags: ['PHP', 'Laravel', 'Vue 3', 'Nuxt', 'PostgreSQL', 'LLMs', 'RAG', 'RabbitMQ', 'Redis', 'Multi-Tenant', 'Vultr', 'Cloudflare', 'NGINX'],
  },
  {
    start: '10/2024', end: '04/2025', roleKey: 'role_fullstack', company: 'Boltech', descKey: 'exp2',
    tags: ['PHP', 'Laravel', 'PostgreSQL', 'React', 'RabbitMQ', 'Redis', 'WebSockets', 'Integração Itaú', 'DDD', 'TDD'],
  },
  {
    start: '05/2022', end: '06/2023', roleKey: 'role_fullstack', company: 'Teros', descKey: 'exp3',
    tags: ['AWS', 'Open Finance', 'BTG Pactual', 'BACEN', 'C#', 'Python', 'Terraform', 'Azure DevOps', 'Segurança'],
  },
  {
    start: '11/2021', end: '05/2022', roleKey: 'role_intern', company: 'Tecnofit', descKey: 'exp4',
    tags: ['PHP', 'SQL', 'MySQL', 'Migração de Dados', 'White-Label', 'Flutter', 'Scrum'],
  },
];

export const PROJECT_FILTERS = [
  { id: 'all', key: 'filter_all' },
  { id: 'ai', key: 'filter_ai' },
  { id: 'backend', key: 'filter_backend' },
  { id: 'cloud', key: 'filter_cloud' },
];

export const PROJECTS = [
  {
    n: 1, category: 'ai', name: 'Cnpjbiz CRM & AI Agents',
    stack: ['Laravel', 'Vue 3', 'LLMs & RAG', 'RabbitMQ', 'Redis', 'PostgreSQL', 'Meta API'],
  },
  {
    n: 2, category: 'cloud', name: 'Multi-Tenant Landing Engine',
    stack: ['NGINX', 'Vultr', 'Cloudflare', 'Laravel', 'Vue 3', 'CSRF Security', 'DNS Automation'],
  },
  {
    n: 3, category: 'backend', name: 'Boltech ERP',
    stack: ['Laravel', 'React', 'PostgreSQL', 'RabbitMQ', 'Redis', 'WebSockets', 'Itaú Banking'],
  },
  {
    n: 4, category: 'cloud', name: 'BTG Pactual Open Finance',
    stack: ['AWS', 'Terraform', 'C#', 'Python', 'Azure DevOps', 'BACEN Compliance'],
  },
  {
    n: 5, category: 'backend', name: 'Tecnofit Platform Suite',
    stack: ['PHP', 'MySQL', 'SQL Tuning', 'Flutter', 'Scrum'],
  },
];
