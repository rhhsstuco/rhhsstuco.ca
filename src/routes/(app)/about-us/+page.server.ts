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
				imageURL: images["default-pfp"],
			},
			{
				name: "Jee-Hoo Park",
				position: "Vice President",
				imageURL: images["default-pfp"],
			},
			{
				name: "Tanya Sham",
				position: "Vice President",
				imageURL: images["default-pfp"],
			},
			{
				name: "Jessie Cui",
				position: "Secretary",
				imageURL: images["default-pfp"],
			},
			{
				name: "Erina Li",
				position: "Treasurer",
				imageURL: images["default-pfp"],
			},
			{
				name: "She-Yun Park",
				position: "Social Convenor",
				imageURL: images["default-pfp"],
			},
			{
				name: "Sherlock Yu",
				position: "External & Equity Affairs",
				imageURL: images["default-pfp"],
			},
			{
				name: "Melody Jia",
				position: "External & Equity Affairs",
				imageURL: images["default-pfp"],
			},
			{
				name: "Debbie Xu",
				position: "Publicity",
				imageURL: images["default-pfp"],
			},
			{
				name: "Karina Chan",
				position: "Media Affairs",
				imageURL: images["default-pfp"],
			},
			{
				name: "Ella Chung",
				position: "Media Affairs",
				imageURL: images["default-pfp"],
			},
			{
				name: "Nicole Chen",
				position: "Media Affairs",
				imageURL: images["default-pfp"],
			},
			{
				name: "Ari Khan",
				position: "Webmaster",
				imageURL: images["default-pfp"],
			},
			{
				name: "TBD",
				position: "Grade 12 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "TBD",
				position: "Grade 12 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "TBD",
				position: "Grade 11 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "TBD",
				position: "Grade 11 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "TBD",
				position: "Grade 10 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "TBD",
				position: "Grade 10 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "TBD",
				position: "Grade 9 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "TBD",
				position: "Grade 9 Rep",
				imageURL: images["default-pfp"],
			},
			{
				name: "TBD",
				position: "Mascot",
				imageURL: images["default-pfp"],
			},
		].map((member, index) => ({ ...member, id: index})),
	};
};