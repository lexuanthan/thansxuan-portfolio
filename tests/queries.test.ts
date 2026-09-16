import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(),
}));

import { createPublicClient } from "@/lib/supabase/public";
import {
  flattenPost,
  getAbout,
  getAiTools,
  getCategories,
  getPostBySlug,
  getPosts,
  getProjects,
  getResources,
  getServices,
  getSettings,
} from "@/lib/queries";
import {
  FALLBACK_ABOUT,
  FALLBACK_AI_TOOLS,
  FALLBACK_PROJECTS,
  FALLBACK_SETTINGS,
} from "@/lib/fallback";

type Result = { data: unknown; error: unknown };

/**
 * Giả lập chuỗi gọi của supabase-js: from().select().eq().order().order()
 * Object trả về vừa cho phép gọi tiếp, vừa await được (có .then).
 */
function fakeClient(result: Result) {
  const builder: Record<string, unknown> = {};
  const promise = Promise.resolve(result);

  Object.assign(builder, {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    maybeSingle: () => promise,
    then: (...args: Parameters<Promise<Result>["then"]>) => promise.then(...args),
  });

  return { from: () => builder };
}

const mocked = vi.mocked(createPublicClient);

beforeEach(() => {
  mocked.mockReset();
});

describe("getProjects", () => {
  it("trả dữ liệu dự phòng khi Supabase chưa cấu hình", async () => {
    mocked.mockReturnValue(null);
    await expect(getProjects()).resolves.toEqual(FALLBACK_PROJECTS);
  });

  it("trả dữ liệu dự phòng khi query báo lỗi", async () => {
    mocked.mockReturnValue(
      fakeClient({ data: null, error: { message: "boom" } }) as never
    );
    await expect(getProjects()).resolves.toEqual(FALLBACK_PROJECTS);
  });

  it("bảng rỗng là câu trả lời thật, KHÔNG dựng lại nội dung mẫu", async () => {
    // Nếu trả về dữ liệu dự phòng ở đây thì mỗi lần xoá sạch dự án trong admin,
    // sáu dự án mẫu sẽ mọc lại ngoài web và không cách nào gỡ được.
    mocked.mockReturnValue(fakeClient({ data: [], error: null }) as never);
    await expect(getProjects()).resolves.toEqual([]);
  });

  it("trả dữ liệu thật khi query thành công", async () => {
    const rows = [{ id: "x", title: "Dự án thật", tags: [], color: "" }];
    mocked.mockReturnValue(fakeClient({ data: rows, error: null }) as never);
    await expect(getProjects()).resolves.toEqual(rows);
  });

  it("không ném lỗi ra ngoài khi client throw", async () => {
    mocked.mockImplementation(() => {
      throw new Error("network down");
    });
    await expect(getProjects()).resolves.toEqual(FALLBACK_PROJECTS);
  });
});

describe("getAiTools", () => {
  it("dùng dữ liệu dự phòng khi lỗi", async () => {
    mocked.mockReturnValue(
      fakeClient({ data: null, error: { message: "boom" } }) as never
    );
    await expect(getAiTools()).resolves.toEqual(FALLBACK_AI_TOOLS);
  });

  it("trả dữ liệu thật khi có", async () => {
    const rows = [{ id: "t1", title: "Tool thật" }];
    mocked.mockReturnValue(fakeClient({ data: rows, error: null }) as never);
    await expect(getAiTools()).resolves.toEqual(rows);
  });
});

describe("getAbout", () => {
  it("dùng dữ liệu dự phòng khi không có bản ghi", async () => {
    mocked.mockReturnValue(fakeClient({ data: null, error: null }) as never);
    await expect(getAbout()).resolves.toEqual(FALLBACK_ABOUT);
  });

  it("vá lại các field jsonb nếu database trả về kiểu sai", async () => {
    mocked.mockReturnValue(
      fakeClient({
        data: { id: 1, heading: "Xin chào", skills: null, journey: "hỏng" },
        error: null,
      }) as never
    );

    const about = await getAbout();
    expect(about.heading).toBe("Xin chào");
    expect(about.skills).toEqual(FALLBACK_ABOUT.skills);
    expect(about.journey).toEqual(FALLBACK_ABOUT.journey);
    expect(Array.isArray(about.core_values)).toBe(true);
  });
});

describe("flattenPost", () => {
  it("gỡ chuyên mục lồng dạng object ra trường phẳng", () => {
    const post = flattenPost({
      id: "p1",
      title: "Bài A",
      categories: { name: "Công nghệ" },
    });
    expect(post.category_name).toBe("Công nghệ");
    expect("categories" in post).toBe(false);
  });

  it("gỡ được cả khi Supabase trả chuyên mục dạng mảng", () => {
    const post = flattenPost({ id: "p2", categories: [{ name: "Sáng tạo" }] });
    expect(post.category_name).toBe("Sáng tạo");
  });

  it("bài chưa gắn chuyên mục vẫn dùng được, không ném lỗi", () => {
    expect(flattenPost({ id: "p3", categories: null }).category_name).toBeNull();
    expect(flattenPost({ id: "p4" }).category_name).toBeNull();
    expect(flattenPost({ id: "p5", categories: [] }).category_name).toBeNull();
  });

  it("luôn cho ra tags là mảng và views là số", () => {
    const post = flattenPost({ id: "p6", tags: null, views: null });
    expect(post.tags).toEqual([]);
    expect(post.views).toBe(0);
  });
});

describe("các module nội dung mới", () => {
  it("trả mảng rỗng khi chưa cấu hình Supabase thay vì làm sập trang", async () => {
    mocked.mockReturnValue(null);
    await expect(getPosts()).resolves.toEqual([]);
    await expect(getCategories()).resolves.toEqual([]);
    await expect(getResources()).resolves.toEqual([]);
    await expect(getServices()).resolves.toEqual([]);
    await expect(getPostBySlug("bat-ky")).resolves.toBeNull();
  });

  it("trả mảng rỗng khi bảng chưa được tạo", async () => {
    mocked.mockReturnValue(
      fakeClient({ data: null, error: { message: 'relation "posts" does not exist' } }) as never
    );
    await expect(getPosts()).resolves.toEqual([]);
    await expect(getServices()).resolves.toEqual([]);
  });

  it("vá bullets và tags khi database trả về null", async () => {
    mocked.mockReturnValue(
      fakeClient({ data: [{ id: "s1", bullets: null }], error: null }) as never
    );
    const services = await getServices();
    expect(services[0].bullets).toEqual([]);
  });
});

describe("getSettings", () => {
  it("dùng dữ liệu dự phòng khi không có bản ghi", async () => {
    mocked.mockReturnValue(fakeClient({ data: null, error: null }) as never);
    await expect(getSettings()).resolves.toEqual(FALLBACK_SETTINGS);
  });

  it("giữ giá trị từ database và vá social khi nó null", async () => {
    mocked.mockReturnValue(
      fakeClient({
        data: { id: 1, brand_name: "Thế giới của Thân LX", social: null },
        error: null,
      }) as never
    );

    const settings = await getSettings();
    expect(settings.brand_name).toBe("Thế giới của Thân LX");
    expect(typeof settings.social).toBe("object");
    expect(settings.social).not.toBeNull();
  });

  it("giữ nguyên social hợp lệ", async () => {
    const social = { github: "https://github.com/lexuanthan" };
    mocked.mockReturnValue(
      fakeClient({ data: { id: 1, social }, error: null }) as never
    );
    await expect(getSettings()).resolves.toMatchObject({ social });
  });
});
