import { MetaEvent } from "@/lib/meta-capi";

const TwoTags = () => (
  <main>
    <MetaEvent event_name="PageView" />
    <MetaEvent
      event_name="ViewContent"
      custom_data={{ content_ids: ["two-tags"], content_type: "product" }}
    />
  </main>
);

export default TwoTags;
