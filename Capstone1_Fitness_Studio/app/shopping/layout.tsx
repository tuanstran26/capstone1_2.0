import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShoppingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header with hideScrollNav prop to hide the scroll navigation */}
      <Header hideScrollNav={true} />
      
      {/* Main content with padding top to account for fixed header */}
      <main className="min-h-screen pt-[124px] bg-gray-50">
        {children}
      </main>
      
      <Footer />
    </>
  );
}
