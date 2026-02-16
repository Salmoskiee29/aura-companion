import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MapPin, Globe, Shield, Users, MessageCircle, ArrowRight } from 'lucide-react';
import logoImg from '@/assets/yourmatch-logo.png';
import { Button } from '@/components/ui/button';

const teamMembers = [
  { name: 'Alex Rivera', role: 'CEO & Founder', desc: "Visionary behind YourMatch's mission to redefine digital companionship." },
  { name: 'Priya Sharma', role: 'CTO', desc: 'Leading our AI engineering and infrastructure at scale.' },
  { name: 'Marcus Chen', role: 'Head of Product', desc: 'Crafting seamless experiences that feel genuinely human.' },
];

const values = [
  { icon: Shield, title: 'Privacy First', desc: 'Your conversations are encrypted end-to-end. We never sell your data.' },
  { icon: Users, title: 'Human Connection', desc: 'Technology that enhances real emotional wellbeing and companionship.' },
  { icon: MessageCircle, title: 'Authentic Conversations', desc: 'Every interaction is designed to feel natural, warm, and meaningful.' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="YourMatch" className="h-6 w-6 rounded" />
            <span className="font-display font-bold text-foreground text-lg">YourMatch</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/models" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Models</Link>
            <Link to="/about" className="text-sm text-foreground font-medium">About</Link>
            <Link to="/auth">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6"
          >
            About YourMatch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            We're building the future of meaningful digital companionship — where technology meets authentic human emotion.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              YourMatch was born from a simple belief: everyone deserves connection. In a world that can feel isolating, 
              we create AI companions that offer warmth, understanding, and genuine conversation — available whenever you need them.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform combines cutting-edge AI with deeply human design principles to deliver experiences that feel 
              natural, safe, and emotionally enriching. We're not replacing human relationships — we're complementing them.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Leadership Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">{member.name.charAt(0)}</span>
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-xs text-primary mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-10">Get in Touch</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-8 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Email</h4>
                  <p className="text-sm text-muted-foreground">support@yourmatch.ai</p>
                  <p className="text-sm text-muted-foreground">business@yourmatch.ai</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Office</h4>
                  <p className="text-sm text-muted-foreground">350 Fifth Avenue, Suite 4810</p>
                  <p className="text-sm text-muted-foreground">New York, NY 10118</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Social</h4>
                  <p className="text-sm text-muted-foreground">@yourmatch on Twitter, Instagram & TikTok</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <h3 className="font-semibold text-foreground mb-4">Send us a message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <textarea
                  placeholder="Your message"
                  rows={4}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Send Message <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="YourMatch" className="h-5 w-5 rounded" />
            <span className="font-display font-bold text-foreground">YourMatch</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 YourMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
