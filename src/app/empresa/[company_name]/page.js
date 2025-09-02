import CompanyDetailsClient from "./CompanyDetailsClient";
import { companiesService } from "../../../services/companiesService";

// Static params generation for static export
export async function generateStaticParams() {
  try {
    const response = await companiesService.getCompaniesSlugs();
    return response.data.map((slug) => ({ company_name: slug }));
  } catch (error) {
    console.warn("Error generating static params for companies:", error);
    return [{ company_name: "0" }];
  }
}

export default function CompanyDetails({ params }) {
  return <CompanyDetailsClient params={params} />;
}
