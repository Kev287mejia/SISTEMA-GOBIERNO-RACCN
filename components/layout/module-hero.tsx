"use client"

interface ModuleHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
}

export function ModuleHero({ 
    title, 
    subtitle, 
    backgroundImage = "/design-assets/hero-money.png" 
}: ModuleHeroProps) {
    return (
        <div className="relative h-64 w-full overflow-hidden shadow-sm">
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform hover:scale-110 duration-[20s]"
                style={{ 
                    backgroundImage: `url('${backgroundImage}')`,
                }}
            />
            <div className="absolute inset-0 z-10 bg-sisgob-magenta/20 backdrop-blur-[2px]" />
            <div className="absolute inset-0 z-15 bg-gradient-to-t from-white/10 to-transparent" />
            
            <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
                <h1 className="font-sans text-[48px] font-bold text-white tracking-widest uppercase drop-shadow-[0_5px_15_rgba(0,0,0,0.5)]">
                    {title}
                </h1>
                <div className="h-[2px] w-32 bg-white/40 mb-4 rounded-full" />
                {subtitle && (
                    <p className="text-white text-lg md:text-xl font-bold uppercase tracking-[0.2em] drop-shadow-lg max-w-4xl leading-snug">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
