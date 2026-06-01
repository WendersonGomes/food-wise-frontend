import { ProtectedPageSkeleton } from "@/components/ui/skeletons/ProtectedPageSkeleton";

export default function Loading() {
  return <ProtectedPageSkeleton pathname="/dashboard" />;
}
