import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCards } from '../context/CardsContext';
import { useTheme } from '../context/ThemeContext';
import { SiteCard } from '../types';

const typeLabel: Record<SiteCard['type'], string> = {
  hotel: 'هتل',
  city: 'شهر',
  banner: 'بنر',
};

function CardInner({ card }: { card: SiteCard }) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl group/card">
      {card.image ? (
        <img
          src={card.image}
          alt={card.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
      )}
      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {/* type badge */}
      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-gray-800 shadow">
        {card.badge || typeLabel[card.type]}
      </span>
      {/* text */}
      <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
        <h3 className="font-extrabold text-lg leading-tight drop-shadow">{card.title}</h3>
        {card.subtitle && <p className="text-sm opacity-90 mt-1 drop-shadow">{card.subtitle}</p>}
      </div>
    </div>
  );
}

function CardLink({ card, className }: { card: SiteCard; className: string }) {
  const link = (card.link || '').trim();
  if (!link) {
    return (
      <div className={className}>
        <CardInner card={card} />
      </div>
    );
  }
  const isExternal = /^https?:\/\//i.test(link);
  if (isExternal) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
        <CardInner card={card} />
      </a>
    );
  }
  return (
    <Link to={link} className={className}>
      <CardInner card={card} />
    </Link>
  );
}

export default function CardSections() {
  const { groups } = useCards();
  const { theme } = useTheme();

  const visible = groups.filter((g) => g.cards.length > 0);
  if (visible.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {visible.map((group) => (
        <div key={group.id}>
          {group.title && (
            <h2 className="text-xl font-black mb-4" style={{ color: theme.colors.textPrimary }}>
              {group.title}
            </h2>
          )}
          <div
            className={
              group.layout === 'vertical'
                ? 'flex flex-col gap-4'
                : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
            }
          >
            {group.cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <CardLink
                  card={card}
                  className={`block ${
                    group.layout === 'vertical' ? 'h-44 sm:h-52' : 'h-52'
                  } card-lift`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
