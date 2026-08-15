import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "default",
  className = "",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback className="bg-gold font-semibold text-ink">
        {getInitials(name) || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
