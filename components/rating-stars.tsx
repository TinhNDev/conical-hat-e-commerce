import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  className?: string;
}

export const RatingStars = ({ rating, className }: RatingStarsProps) => {
  const rounded = Math.round(rating);

  return (
    <div className={cn("flex items-center gap-1 text-amber-500", className)}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true">
          {index < rounded ? "★" : "☆"}
        </span>
      ))}
      <span className="ml-1 text-sm font-medium text-stone-600">{rating}</span>
    </div>
  );
};
