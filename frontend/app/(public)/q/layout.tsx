export default function PublicQuestionnaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout bypasses the main app layout with sidebar/menu
  // Providing a clean, standalone experience for public questionnaires
  return children;
}
