import { motion } from "framer-motion";
import { Star, StarHalf } from "lucide-react";

const reviews = [
  { text: "Alan really knows his stuff. Helped me choose my first AEG and I have had zero regrets.", author: "Mark D.", stars: 5 },
  { text: "Brilliant store. Got everything I needed for my first game day in one visit.", author: "Sophie R.", stars: 5 },
  { text: "Best airsoft shop in Dublin, hands down. Fair prices and the advice is worth the visit alone.", author: "Conor M.", stars: 5 },
  { text: "I had no idea where to start. Alan spent 20 mins with me explaining setups. Could not ask for better service.", author: "Jamie L.", stars: 5 },
  { text: "Fixed my rifle fast and cheaply. Would not go anywhere else for repairs.", author: "David K.", stars: 4 },
  { text: "Great selection, honest advice, and never any pressure to overspend.", author: "Aoife B.", stars: 5 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        if (i < Math.floor(rating)) {
          return <Star key={i} className="w-4 h-4 fill-accent text-accent" />;
        } else if (i === Math.floor(rating) && rating % 1 !== 0) {
          return <StarHalf key={i} className="w-4 h-4 fill-accent text-accent" />;
        } else {
          return <Star key={i} className="w-4 h-4 text-muted-foreground" />;
        }
      })}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            What Dublin Players Say
          </h2>
          <div className="flex flex-col items-center justify-center gap-2">
            <StarRating rating={4.7} />
            <p className="text-sm text-muted-foreground font-medium">
              4.7 out of 5 - Based on 90 Google Reviews
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-card border border-border p-8 flex flex-col justify-between rounded-sm"
            >
              <div>
                <StarRating rating={review.stars} />
                <p className="mt-4 text-foreground/90 font-medium leading-relaxed italic">
                  "{review.text}"
                </p>
              </div>
              <p className="mt-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                - {review.author}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
