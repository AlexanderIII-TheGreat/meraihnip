export default function Empty() {
  return (
    <section className="header min-h-[90vh] px-7 pt-10">
      <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
        <div className="title">
          <h1 className="text-2xl text-indigo-950 font-bold mb-1">Title</h1>
          <p className="text-sm text-gray-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus
            fugit voluptates iste impedit, repellen
          </p>
        </div>
      </div>
    </section>
  );
}
