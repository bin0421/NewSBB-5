export const samplePost = {
  id: 1,
  createDate: "2026-01-01T00:00:00",
  modifyDate: "2026-01-01T00:00:00",
  title: "제목 1",
  content: "내용 1",
};

export const comment = (id: number, content: string) => ({
  id,
  createDate: "2026-01-01T00:00:00",
  modifyDate: "2026-01-01T00:00:00",
  content,
});
