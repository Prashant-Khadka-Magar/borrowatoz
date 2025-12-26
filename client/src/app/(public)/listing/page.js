import Card from "@/components/Card";

export default function ListingBrowse() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-semibold">Popular Tools in Toronto</h1>

        <div className="mt-4 flex justify-center gap-6 flex-wrap">
          <Card />
          <Card />
        </div>
      </section>

      <section>
        <h1 className="text-xl font-semibold">Popular Services in Toronto</h1>

        <div className="mt-4 flex justify-center gap-6 flex-wrap">
          <Card />
          <Card />
        </div>
      </section>
    </div>
  );
}
