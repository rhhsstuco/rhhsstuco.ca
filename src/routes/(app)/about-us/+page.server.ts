import getMembers from "$lib/data/members";
import type StucoMember from "$lib/models/StucoMember.model";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const images = await getMembers();

	return {
		members: <StucoMember[]> [
			{
				name: "Shawn Xiao",
				position: "President",
				imageURL: images["shawn-xiao"],
			},
			{
				name: "Jee-Hoo Park",
				position: "Vice President",
				imageURL: images["jee-hoo-park"],
			},
			{
				name: "Tanya Sham",
				position: "Vice President",
				imageURL: images["tanya-sham"],
			},
			{
				name: "Jessie Cui",
				position: "Secretary",
				imageURL: images["jessie-cui"],
			},
			{
				name: "Erina Li",
				position: "Treasurer",
				imageURL: images["erina-li"],
			},
			{
				name: "She-Yun Park",
				position: "Social Convenor",
				imageURL: images["she-yun-park"],
			},
			{
				name: "Sherlock Yu",
				position: "External & Equity Affairs",
				imageURL: images["default-pfp"],
			},
			{
				name: "Melody Jia",
				position: "External & Equity Affairs",
				imageURL: images["melody-jia"],
			},
			{
				name: "Debbie Xu",
				position: "Publicity",
				imageURL: images["debbie-xu"],
			},
			{
				name: "Karina Chan",
				position: "Media Affairs",
				imageURL: images["karina-chan"],
			},
			{
				name: "Ella Chung",
				position: "Media Affairs",
				imageURL: images["ella-chung"],
			},
			{
				name: "Nicole Chen",
				position: "Media Affairs",
				imageURL: images["nicole-chen"],
			},
			{
				name: "Ari Khan",
				position: "Webmaster",
				imageURL: images["ari-khan"],
			},
			{
				name: "Yunnie Wang",
				position: "Grade 12 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "Olivia Wu",
				position: "Grade 12 Rep",
				imageURL: images["olivia-wu"],
			},
			{
				name: "Ronnie Liu",
				position: "Grade 11 Rep",
				imageURL: images["ronnie-liu"],
			},
			{
				name: "Angela Yan",
				position: "Grade 11 Rep",
				imageURL: images["angela-yan"],
			},
			{
				name: "Eleanor Yang",
				position: "Grade 10 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "Norris Ji",
				position: "Grade 10 Rep",
				imageURL: images["norris-ji"],
			},
			{
				name: "Niknaz Jafari",
				position: "Grade 9 Rep",
				imageURL: images["niknaz-jafari"],
			},
			{
				name: "Madi Gonzalvo",
				position: "Grade 9 Rep",
				imageURL: images["madi-gonzalvo"],
			},
			{
				name: "Tessa Berinde",
				position: "Mascot",
				imageURL: images["tessa-berinde"],
			},
		].map((member, index) => ({ ...member, id: index})),
	};
};