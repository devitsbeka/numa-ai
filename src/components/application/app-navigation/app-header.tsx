"use client";

import { Bell01, ChevronLeft, HelpCircle, SearchLg, Sliders01 } from "@untitledui/icons";
import { Button as AriaButton, Popover } from "react-aria-components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { NavItemBase } from "@/components/application/app-navigation/base-components/nav-item";
import { NavItemButton } from "@/components/application/app-navigation/base-components/nav-item-button";
import { NavAccountMenu } from "@/components/application/app-navigation/base-components/nav-account-card";
import { Tab, TabList, Tabs } from "@/components/application/tabs/tabs";
import { DialogTrigger } from "@/components/application/modals/modal";
import { cx } from "@/utils/cx";
import type { ReactNode } from "react";

interface AppHeaderProps {
    /** Content to show in the secondary navigation bar (left side) */
    secondaryNavLeft?: ReactNode;
    /** Content to show in the secondary navigation bar (center) */
    secondaryNavCenter?: ReactNode;
    /** Tabs to show in the secondary navigation bar (right side) */
    secondaryNavTabs?: {
        selectedKey: string;
        onSelectionChange: (key: string) => void;
        items: Array<{ id: string; label: string }>;
    };
    /** Additional content to show in the secondary navigation bar (right side, after tabs) */
    secondaryNavRight?: ReactNode;
    /** Callback to open filters modal */
    onFiltersClick?: () => void;
    /** Count of custom recipes to display */
    customRecipesCount?: number;
}

export const AppHeader = ({ secondaryNavLeft, secondaryNavCenter, secondaryNavTabs, secondaryNavRight, onFiltersClick, customRecipesCount }: AppHeaderProps) => {
    const pathname = usePathname();
    
    return (
        <header className="max-lg:hidden">
            {/* Top header bar */}
            <section className="flex h-16 w-full items-center justify-center border-b border-secondary bg-primary md:h-18">
                <div className="flex w-full max-w-container items-center justify-between gap-4 px-4 md:px-8">
                    {/* Logo */}
                    <Link
                        href="/"
                        aria-label="Go to homepage"
                        className="rounded-xs outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <span className="text-xl font-semibold text-utility-success-600">Yumlet</span>
                    </Link>

                    {/* Navigation in center */}
                    <nav className="flex-1 flex justify-center">
                        <ul className="flex items-center gap-0.5">
                            <li className="py-0.5">
                                <NavItemBase href="/" current={pathname === "/"} type="link">
                                    Overview
                                </NavItemBase>
                            </li>
                            <li className="py-0.5">
                                <NavItemBase href="/recipes" current={pathname === "/recipes"} type="link">
                                    Explore
                                </NavItemBase>
                            </li>
                            <li className="py-0.5">
                                <NavItemBase href="/learn" current={pathname === "/learn"} type="link">
                                    Learn
                                </NavItemBase>
                            </li>
                            <li className="py-0.5">
                                <NavItemBase href="/stats" current={pathname === "/stats"} type="link">
                                    My Stats
                                </NavItemBase>
                            </li>
                            <li className="py-0.5">
                                <NavItemBase href="/my-kitchen" current={pathname === "/my-kitchen"} type="link">
                                    My Kitchen
                                </NavItemBase>
                            </li>
                        </ul>
                    </nav>

                    {/* Right side icons and avatar */}
                    <div className="flex items-center gap-3">
                        <NavItemButton
                            size="md"
                            icon={Bell01}
                            label="Notifications"
                            href="#"
                            tooltipPlacement="bottom"
                        />
                        <NavItemButton
                            size="md"
                            icon={HelpCircle}
                            label="Help"
                            href="#"
                            tooltipPlacement="bottom"
                        />
                        <DialogTrigger>
                            <AriaButton
                                className={({ isPressed, isFocused }) =>
                                    cx(
                                        "group relative inline-flex cursor-pointer",
                                        (isPressed || isFocused) && "rounded-full outline-2 outline-offset-2 outline-focus-ring",
                                    )
                                }
                            >
                                <Avatar alt="BK" src="https://www.untitledui.com/images/avatars/olivia-rhye?bg=%23E0E0E0" size="md" />
                            </AriaButton>
                            <Popover
                                placement="bottom right"
                                offset={8}
                                className={({ isEntering, isExiting }) =>
                                    cx(
                                        "will-change-transform",
                                        isEntering &&
                                            "duration-300 ease-out animate-in fade-in placement-right:slide-in-from-left-2 placement-top:slide-in-from-bottom-2 placement-bottom:slide-in-from-top-2",
                                        isExiting &&
                                            "duration-150 ease-in animate-out fade-out placement-right:slide-out-to-left-2 placement-top:slide-out-to-bottom-2 placement-bottom:slide-out-to-top-2",
                                    )
                                }
                            >
                                <NavAccountMenu />
                            </Popover>
                        </DialogTrigger>
                    </div>
                </div>
            </section>

            {/* Secondary navigation */}
            <section className="flex h-16 w-full items-center justify-center border-b border-secondary bg-primary">
                <div className="flex w-full max-w-container items-center justify-between gap-4 px-4 md:px-8">
                    {/* Left side - Search bar and Filters button */}
                    <div className="flex-1 flex items-center gap-3">
                        {secondaryNavLeft || (
                            <>
                                <div className="flex-1 max-w-2xl">
                                    <Input
                                        placeholder="Search recipes, ingredients, or cuisines..."
                                        icon={SearchLg}
                                        size="md"
                                        className="w-full"
                                    />
                                </div>
                                {onFiltersClick && (
                                    <Button
                                        color="secondary"
                                        size="md"
                                        iconLeading={Sliders01}
                                        onClick={onFiltersClick}
                                    >
                                        Filters
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Center content */}
                    {secondaryNavCenter && (
                        <div className="flex items-center justify-center">
                            {secondaryNavCenter}
                        </div>
                    )}

                    {/* Right side tabs and additional content */}
                    <div className="flex items-center gap-2 shrink-0">
                        {secondaryNavTabs && (
                            <Tabs 
                                selectedKey={secondaryNavTabs.selectedKey} 
                                onSelectionChange={(key) => {
                                    // Immediate state update for smooth tab switching
                                    secondaryNavTabs.onSelectionChange(String(key));
                                }}
                            >
                                <TabList type="button-minimal" size="sm" items={[]}>
                                    {secondaryNavTabs.items.map((item) => (
                                        <Tab key={item.id} id={item.id}>
                                            {item.label}
                                        </Tab>
                                    ))}
                                </TabList>
                            </Tabs>
                        )}
                        {secondaryNavRight}
                    </div>
                </div>
            </section>
        </header>
    );
};

