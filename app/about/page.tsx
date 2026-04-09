import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { teamMembers } from "@/lib/ecommerce";

const values = [
  {
    title: "Giữ hồn thủ công",
    description:
      "Mỗi chiếc nón được hoàn thiện từ chất liệu tự nhiên và giữ lại cảm giác mộc, nhẹ, thoáng của nghề thủ công Việt.",
  },
  {
    title: "Thiết kế để nổi bật",
    description:
      "LUMI không làm nón đại trà. Chúng tôi ưu tiên bố cục, màu sắc và chi tiết vẽ tay để mỗi sản phẩm có cá tính riêng.",
  },
  {
    title: "Hiện đại nhưng gần gũi",
    description:
      "Tinh thần truyền thống được đặt vào ngữ cảnh mới: đi biển, chụp ảnh, quà tặng, thời trang và những khoảnh khắc đời thường.",
  },
];

const processSteps = [
  "Chọn phom nón, chất liệu và hướng trang trí phù hợp với mục đích sử dụng.",
  "Tinh chỉnh họa tiết, bảng màu và điểm nhấn thủ công để tạo dấu ấn riêng.",
  "Hoàn thiện, kiểm tra tổng thể và đóng gói chỉn chu trước khi đến tay khách hàng.",
];

export default function AboutPage() {
  return (
    <div className="space-y-10 pb-10">
      <section className="relative -mx-4 overflow-hidden rounded-[2rem] border border-[#dcc9ac] bg-[linear-gradient(135deg,#f7ead8_0%,#fbf6ef_46%,#e4efe7_100%)] px-6 py-8 shadow-[0_30px_80px_rgba(120,98,68,0.12)] sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-[#f0c98d]/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#b8d3c1]/35 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,250,243,0.82)_0%,rgba(255,255,255,0.52)_100%)] p-6 shadow-[0_24px_60px_rgba(120,98,68,0.08)] backdrop-blur-[3px] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-900">
              Về LUMI
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-5xl leading-[0.92] text-stone-950 sm:text-6xl lg:text-7xl">
                Nón lá Việt được kể lại bằng ngôn ngữ thanh lịch và đương đại.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
                LUMI tạo ra những chiếc nón lá thủ công dành cho người muốn mang một
                dấu ấn Việt rõ ràng hơn trong phong cách cá nhân. Chúng tôi kết hợp
                chất liệu truyền thống, cảm hứng mỹ thuật và cách trình bày hiện đại
                để mỗi thiết kế vừa gần gũi, vừa đủ khác biệt để được nhớ đến.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Chất liệu
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-950">
                  Lá tự nhiên
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Hoàn thiện
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-950">
                  Vẽ tay, cá nhân hóa
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Cảm hứng
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-950">
                  Nét Việt đương đại
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-stone-950 px-7 text-sm uppercase tracking-[0.18em] text-white hover:bg-stone-800"
              >
                <Link href="/products">Khám phá bộ sưu tập</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-stone-300 bg-white/80 px-7 text-sm uppercase tracking-[0.18em] text-stone-800 hover:bg-white"
              >
                <Link href="/contact">Liên hệ đặt thiết kế riêng</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-white/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,251,245,0.95)_0%,rgba(240,230,215,0.96)_100%)] p-4 shadow-[0_28px_70px_rgba(120,98,68,0.14)]">
              <div className="grid gap-4">
                <div className="relative h-[420px] overflow-hidden rounded-[1.6rem] bg-stone-200">
                  <Image
                    src="/non-la-vector.jpg"
                    alt="Nón lá thủ công mang tinh thần Việt hiện đại"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 42vw, 100vw"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/75 bg-white/75 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Cảm giác thương hiệu
                    </p>
                    <p className="mt-2 text-sm leading-6 text-stone-700">
                      Ấm, tinh tế, đủ nghệ thuật nhưng vẫn dễ chạm đến trong đời sống hằng ngày.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/75 bg-[#f8f1e8] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                      Mục tiêu
                    </p>
                    <p className="mt-2 text-sm leading-6 text-stone-700">
                      Biến nón lá từ món phụ kiện quen thuộc thành điểm nhấn thời trang có câu chuyện riêng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Câu chuyện
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-stone-950 sm:text-5xl">
            Chúng tôi bắt đầu từ một câu hỏi đơn giản: nón lá có thể đẹp theo một cách mới hơn không?
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-stone-700 sm:text-base">
            <p>
              Câu trả lời của LUMI là có. Khi được đặt lại trong bối cảnh mới, nón lá
              không chỉ là biểu tượng văn hóa mà còn có thể trở thành một món phụ kiện
              có gu, có cá tính và có giá trị thẩm mỹ rõ ràng.
            </p>
            <p>
              Vì vậy, chúng tôi xây dựng sản phẩm như một sự giao thoa giữa nghề thủ công,
              cảm hứng Việt và tư duy thiết kế hiện đại. Mỗi chiếc nón là một bề mặt để
              kể chuyện bằng màu sắc, nét vẽ và nhịp điệu hình ảnh.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.title}
              className="rounded-[1.8rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f6f0e7_100%)] p-6 shadow-[0_18px_44px_rgba(15,23,42,0.06)]"
            >
              <p className="text-xs uppercase tracking-[0.26em] text-amber-800">
                Giá trị
              </p>
              <h3 className="mt-4 font-display text-3xl leading-tight text-stone-950">
                {value.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-stone-700">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[2rem] border border-[#d7c3a0] bg-[linear-gradient(160deg,#f6ecde_0%,#efe3d2_52%,#e7efe9_100%)] p-6 shadow-[0_24px_70px_rgba(120,98,68,0.10)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-900">
            Quy trình thực hiện
          </p>
          <div className="mt-6 space-y-4">
            {processSteps.map((step, index) => (
              <div
                key={step}
                className="flex gap-4 rounded-[1.5rem] border border-white/75 bg-white/70 p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
                  0{index + 1}
                </div>
                <p className="pt-1 text-sm leading-7 text-stone-700 sm:text-base">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-white shadow-[0_24px_64px_rgba(15,23,42,0.12)] sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
            Đội ngũ
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-white">
            Những người đứng sau trải nghiệm LUMI.
          </h2>
          <p className="mt-4 text-sm leading-7 text-stone-300">
            Trang này cũng là nơi giới thiệu thành viên thực hiện dự án. Phần trình bày
            được nâng cấp để thông tin nhóm không còn chỉ là một danh sách khô cứng.
          </p>
          <div className="mt-8 space-y-4">
            {teamMembers.map((member, index) => (
              <article
                key={`${member.name}-${index}`}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                  {member.role}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {member.name}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
