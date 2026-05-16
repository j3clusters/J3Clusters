import { MemberRegisterPage } from "@/components/MemberRegisterPage";
import { COMMUNITY_MEMBER } from "@/lib/consultant-labels";
import { getMemberOAuthAvailability } from "@/lib/auth/member-oauth-availability";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Join as a community member",
  description: COMMUNITY_MEMBER.registerSub,
  path: "/register/member",
});

export default function RegisterMemberPage() {
  const oauth = getMemberOAuthAvailability();

  return <MemberRegisterPage oauth={oauth} />;
}
