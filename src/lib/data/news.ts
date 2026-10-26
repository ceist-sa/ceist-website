export interface NewsItem {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  description: string;
  /** Longer text for the concert page; paragraphs separated by blank lines */
  details?: string;
  /** Programme, one piece per line (e.g. "Vivaldi — As Quatro Estações") */
  program?: string;
  price?: string;
  ticketUrl?: string;
  imageUrl?: string;
}
