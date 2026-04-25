import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  SparklesIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const principles = [
  {
    icon: SunIcon,
    title: "Nét Việt rõ ràng",
    description:
      "LUMI giữ phom nón lá quen thuộc, chất liệu tự nhiên và cảm giác nhẹ thoáng của thủ công Việt.",
  },
  {
    icon: PaintBrushIcon,
    title: "Thiết kế có gu",
    description:
      "Màu sắc, họa tiết và bố cục được tiết chế để chiếc nón vừa nổi bật, vừa đủ thanh lịch khi sử dụng.",
  },
  {
    icon: SparklesIcon,
    title: "Dành cho đời sống mới",
    description:
      "Từ du lịch, chụp ảnh đến quà tặng, mỗi sản phẩm được làm để mang dấu ấn cá nhân hơn.",
  },
];

const processSteps = [
  "Chọn phom nón, chất liệu và cảm hứng thiết kế.",
  "Hoàn thiện họa tiết thủ công với bảng màu riêng.",
  "Kiểm tra dáng, bề mặt và đóng gói trước khi giao.",
];

const highlights = ["Lá tự nhiên", "Vẽ tay", "Cá nhân hóa", "Đóng gói chỉn chu"];

const teamMembers = [
  {
    name: "Võ Thị Ly Ly",
    id: "24126125",
    role: "Định hướng ý tưởng & Điều phối",
    contribution:
      "Tham gia lên ý tưởng chung, định hướng phong cách website và phối hợp các thành viên để hoàn thiện sản phẩm.",
    github: "https://github.com/lyly",
  },
  {
    name: "Nguyễn Thị Trúc Ly",
    id: "24126122",
    role: "Thiết kế giao diện & Sáng tạo",
    contribution:
      "Cùng nhóm xây dựng ý tưởng, tập trung thiết kế giao diện và trải nghiệm người dùng.",
    github: "https://github.com/trucly",
  },
  {
    name: "Phạm Nguyễn Thanh Mai",
    id: "24126128",
    role: "Phát triển chức năng & Triển khai",
    contribution:
      "Tham gia đề xuất ý tưởng và xây dựng các chức năng chính của website.",
    github: "https://github.com/thanhmai",
  },
  {
    name: "Nguyễn Mai Khánh Linh",
    id: "24126115",
    role: "Xây dựng dữ liệu & Hệ thống",
    contribution:
      "Cùng nhóm lên ý tưởng cấu trúc, triển khai dữ liệu và hỗ trợ vận hành hệ thống.",
    github: "https://github.com/khanhlinh",
  },
  {
    name: "Lê Trần Trà My",
    id: "24126134",
    role: "Nội dung & Hình ảnh thương hiệu",
    contribution:
      "Tham gia sáng tạo ý tưởng và xây dựng nội dung, hình ảnh cho sản phẩm nón lá.",
    github: "https://github.com/tramy",
  },
  {
    name: "Lê Việt Nhật",
    id: "24126159",
    role: "Kiểm thử & Hoàn thiện",
    contribution:
      "Cùng nhóm phát triển ý tưởng, kiểm tra và tối ưu để hoàn thiện sản phẩm cuối cùng.",
    github: "https://github.com/vietnhat",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-10 pb-10">
      <section className="relative -mx-4 overflow-hidden rounded-[2rem] border border-stone-200 bg-[#f6efe4] shadow-[0_30px_80px_rgba(120,98,68,0.12)]">
        <div className="grid min-h-[620px] lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-8 lg:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8f5f2a]">
              Về LUMI
            </p>

            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.94] text-stone-950 sm:text-6xl lg:text-7xl">
              Nón lá Việt, được làm mới cho phong cách hiện đại.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
              LUMI tạo ra những chiếc nón lá thủ công có tính thẩm mỹ cao:
              nhẹ, tinh tế, dễ phối và đủ khác biệt để trở thành điểm nhấn
              riêng trong mỗi khoảnh khắc.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-stone-950 px-7 text-sm uppercase tracking-[0.16em] text-white hover:bg-stone-800"
              >
                <Link href="/products">Xem bộ sưu tập</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-stone-300 bg-white/70 px-7 text-sm uppercase tracking-[0.16em] text-stone-800 hover:bg-white"
              >
                <Link href="/contact">Đặt thiết kế riêng</Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/80 bg-white/60 px-4 py-3 text-sm font-semibold text-stone-800"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden bg-stone-200">
            <Image
              src="/non-la-vector.jpg"
              alt="Nón lá thủ công LUMI"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />

            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent_0%,rgba(28,25,23,0.68)_100%)] p-6 text-white sm:p-8">
              <p className="max-w-sm text-sm leading-6 text-white/86">
                Một biểu tượng truyền thống được trình bày bằng ngôn ngữ gọn,
                sạch và giàu cảm xúc hơn.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {principles.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(15,23,42,0.08)] dark:border-stone-800 dark:bg-stone-950"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0e3d2] text-[#8f5f2a] dark:bg-stone-800 dark:text-stone-100">
                <Icon className="h-5 w-5" />
              </div>

              <h2 className="mt-5 font-display text-3xl leading-tight text-stone-950 dark:text-stone-50">
                {item.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">
                {item.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-stone-200 bg-stone-950 p-6 text-white shadow-[0_24px_64px_rgba(15,23,42,0.12)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
            Câu chuyện
          </p>

          <h2 className="mt-4 max-w-xl font-display text-4xl leading-tight text-white sm:text-5xl">
            Chúng tôi tin nón lá có thể bước vào đời sống hiện đại một cách tự
            nhiên.
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">
            Thay vì biến nón lá thành món lưu niệm đại trà, LUMI tập trung vào
            chất liệu, hình dáng và chi tiết thủ công để mỗi thiết kế có cảm
            giác gần gũi nhưng vẫn đủ chỉn chu.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(135deg,#fffaf3_0%,#eef6f0_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8f5f2a]">
            Quy trình
          </p>

          <div className="mt-6 grid gap-4">
            {processSteps.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-xl border border-white/80 bg-white/72 p-4"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
                  0{index + 1}
                </div>

                <div>
                  <p className="font-semibold text-stone-950">
                    {index === 0
                      ? "Định hướng"
                      : index === 1
                        ? "Thực hiện"
                        : "Hoàn thiện"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* TEAM SECTION */}
<section className="rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(135deg,#fffaf3_0%,#eef6f0_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8f5f2a]">
        Đội ngũ phát triển
      </p>

      <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-stone-950 sm:text-5xl">
        Những người cùng xây dựng trải nghiệm LUMI.
      </h2>
    </div>

    <p className="max-w-xl text-sm leading-7 text-stone-600 sm:text-base">
      Mỗi thành viên đảm nhận một vai trò riêng, cùng phối hợp từ ý tưởng,
      thiết kế, nội dung, dữ liệu, chức năng đến kiểm thử để hoàn thiện sản phẩm.
    </p>
  </div>

  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {teamMembers.map((member) => (
      <article
        key={member.id}
        className="rounded-[1.4rem] border border-stone-200 bg-white/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
              MSSV: {member.id}
            </p>

            <h3 className="mt-2 text-lg font-semibold leading-snug text-stone-950">
              {member.name}
            </h3>
          </div>

          <Link
            href={member.github}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-900 hover:bg-stone-900 hover:text-white"
          >
            GitHub
          </Link>
        </div>

        <p className="mt-4 text-sm font-semibold text-[#8f5f2a]">
          {member.role}
        </p>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          {member.contribution}
        </p>
      </article>
    ))}
  </div>
</section>

      <section className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-stone-800 dark:bg-stone-950">
        <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-[280px] bg-stone-200">
            <Image
              src="/2086ffee-e7e2-4783-ae8e-401dcd895463.jpeg"
              alt="Chi tiết sản phẩm nón lá LUMI"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 34vw, 100vw"
            />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500 dark:text-stone-400">
              Sẵn sàng khám phá
            </p>

            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-stone-950 dark:text-stone-50">
              Chọn một chiếc nón phù hợp với phong cách của bạn.
            </h2>

            <div className="mt-5 grid gap-3 text-sm leading-6 text-stone-600 dark:text-stone-300 sm:grid-cols-2">
              <p className="flex gap-2">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-[#8f5f2a] dark:text-stone-200" />
                Phù hợp cho du lịch, chụp ảnh và làm quà tặng.
              </p>

              <p className="flex gap-2">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-[#8f5f2a] dark:text-stone-200" />
                Có thể trao đổi để đặt thiết kế mang dấu ấn riêng.
              </p>
            </div>

            <Link
              href="/products"
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#8f5f2a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#7a5124] dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
            >
              Mua sắm ngay
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}