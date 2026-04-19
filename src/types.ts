export type TagVariant = 'default' | 'good' | 'warn';

export type Tag = { label: string; variant: TagVariant };
export type Link = { label: string; url: string };
export type MetaKV = { k: string; v: string };

export type Company = {
  id: string;
  slug: string;
  name: string;
  maker: string;
  logo: string;
  tags: Tag[];
  tagline: string;
  paragraphs: string[];
  meta: MetaKV[];
  links: Link[];
  category: string;
  categorySlug: string;
  categoryName: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  companyIds: string[];
};

export type CategoryNode = Category & {
  x: number;
  y: number;
  r: number;
};
