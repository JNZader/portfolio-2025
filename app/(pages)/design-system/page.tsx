import { notFound } from 'next/navigation';
import { RevealOnScroll } from '@/components/animations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Section, {
  SECTION_BG,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/Section';

export const metadata = {
  title: 'Design System',
  description: 'Documentación de componentes shadcn/ui',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  // Only available in development
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return (
    <>
      {/* Hero */}
      <Section background={SECTION_BG.GRADIENT} spacing="xl">
        <Container>
          <RevealOnScroll>
            <SectionHeader centered>
              <SectionTitle size="xl">Design System</SectionTitle>
              <SectionDescription size="lg" className="mx-auto">
                Componentes instalados con shadcn/ui CLI. Sistema profesional con dark mode.
              </SectionDescription>
            </SectionHeader>
          </RevealOnScroll>
        </Container>
      </Section>

      {/* Colors */}
      <Section>
        <Container>
          <RevealOnScroll>
            <h2 className="text-3xl font-bold mb-6">Semantic Colors</h2>
          </RevealOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="Background" className="bg-background text-foreground border" />
            <ColorSwatch name="Foreground" className="bg-foreground text-background" />
            <ColorSwatch name="Primary" className="bg-primary text-primary-foreground" />
            <ColorSwatch name="Secondary" className="bg-secondary text-secondary-foreground" />
            <ColorSwatch name="Muted" className="bg-muted text-muted-foreground" />
            <ColorSwatch name="Accent" className="bg-accent text-accent-foreground" />
            <ColorSwatch
              name="Destructive"
              className="bg-destructive text-destructive-foreground"
            />
            <ColorSwatch name="Border" className="bg-border" />
          </div>
        </Container>
      </Section>

      {/* Typography */}
      <Section background={SECTION_BG.MUTED}>
        <Container>
          <RevealOnScroll>
            <h2 className="text-3xl font-bold mb-6">Typography</h2>
          </RevealOnScroll>
          <div className="space-y-4">
            {[
              { size: 'text-5xl', label: '5xl' },
              { size: 'text-4xl', label: '4xl' },
              { size: 'text-3xl', label: '3xl' },
              { size: 'text-2xl', label: '2xl' },
              { size: 'text-xl', label: 'xl' },
              { size: 'text-lg', label: 'lg' },
              { size: 'text-base', label: 'base' },
              { size: 'text-sm', label: 'sm' },
              { size: 'text-xs', label: 'xs' },
            ].map(({ size, label }) => (
              <div key={size}>
                <p className="text-sm text-muted-foreground mb-1">{label}</p>
                <p className={`${size} font-bold`}>The quick brown fox</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Buttons */}
      <Section>
        <Container>
          <RevealOnScroll>
            <h2 className="text-3xl font-bold mb-6">Buttons</h2>
          </RevealOnScroll>

          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <PlusIcon />
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-xl font-semibold mb-4">States</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Inputs */}
      <Section background={SECTION_BG.MUTED}>
        <Container>
          <RevealOnScroll>
            <h2 className="text-3xl font-bold mb-6">Inputs</h2>
          </RevealOnScroll>

          <div className="max-w-md space-y-6">
            <div>
              <label htmlFor="input-1" className="block text-sm font-medium mb-2">
                Normal Input
              </label>
              <Input id="input-1" type="email" placeholder="john@example.com" />
            </div>

            <div>
              <label htmlFor="input-2" className="block text-sm font-medium mb-2">
                Disabled
              </label>
              <Input id="input-2" placeholder="Disabled input" disabled />
            </div>

            <div>
              <label htmlFor="input-3" className="block text-sm font-medium mb-2">
                With Value
              </label>
              <Input id="input-3" defaultValue="Some value" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Badges */}
      <Section>
        <Container>
          <RevealOnScroll>
            <h2 className="text-3xl font-bold mb-6">Badges</h2>
          </RevealOnScroll>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Examples</h3>
              <div className="flex flex-wrap gap-4">
                <Badge>New</Badge>
                <Badge variant="secondary">Beta</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="outline">Draft</Badge>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Cards */}
      <Section background={SECTION_BG.MUTED}>
        <Container>
          <RevealOnScroll>
            <h2 className="text-3xl font-bold mb-6">Cards</h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {/* Simple Card */}
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>A basic card example</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">This is the card content area.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>

            {/* Card with Badge */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>With Badge</CardTitle>
                  <Badge>Active</Badge>
                </div>
                <CardDescription>Last updated 2 hours ago</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Card with a badge in the header.</p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Confirm</Button>
              </CardFooter>
            </Card>

            {/* Form Card */}
            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>Subscribe to our updates</CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="Enter your email" type="email" />
              </CardContent>
              <CardFooter>
                <Button className="w-full">Subscribe</Button>
              </CardFooter>
            </Card>

            {/* List Card */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>What's included</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-primary" />
                    <span>Design System</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-primary" />
                    <span>Dark Mode</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-primary" />
                    <span>TypeScript</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Component Composition */}
      <Section>
        <Container>
          <RevealOnScroll>
            <h2 className="text-3xl font-bold mb-6">Component Composition</h2>
          </RevealOnScroll>

          <Card className="max-w-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Full Example</CardTitle>
                  <CardDescription>Using multiple components together</CardDescription>
                </div>
                <Badge variant="secondary">Demo</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="flex gap-2 pt-2">
                <Badge>React 19</Badge>
                <Badge variant="secondary">Next.js 16</Badge>
                <Badge variant="outline">TypeScript</Badge>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Submit</Button>
            </CardFooter>
          </Card>
        </Container>
      </Section>
    </>
  );
}

// Helper Components
function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-2">
      <div
        className={`h-20 rounded-lg flex items-center justify-center font-medium text-sm ${className}`}
      >
        {name}
      </div>
      <p className="text-xs text-center text-muted-foreground">{name}</p>
    </div>
  );
}

// Icons
function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <title>Plus</title>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <title>Check</title>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
