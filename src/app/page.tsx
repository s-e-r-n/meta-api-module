import { MetaEvent } from "@/lib/meta-capi";

const Home = () => (
  <main>
    <MetaEvent event_name="PageView" />
  </main>
);

export default Home;
