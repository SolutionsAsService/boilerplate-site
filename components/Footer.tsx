import { SITE } from '@/lib/data'
export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <p><b>{SITE.name} is a demonstration.</b> The outfitter, its rivers, prices and policies are invented to show how a rafting site can work. No booking is taken and no payment is collected. Whitewater is dangerous: read <a href="/safety/">Safety</a>.</p>
        <p>No cookies, no analytics, no request to another site. <a href="https://github.com/SolutionsAsService/boilerplate-site">Source on GitHub</a> · MIT licence.</p>
      </div>
    </footer>
  )
}
