"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { AiTool } from "@/types";
import { getRoleColor, getCategoryIcon, formatPricing, generateStars } from "@/lib/utils";

interface ToolCardProps {
  tool: AiTool;
  showCategories?: boolean;
  showRoles?: boolean;
}

export default function ToolCard({ tool, showCategories = true, showRoles = true }: ToolCardProps) {
  const [imageError, setImageError] = useState(false);
  const pricingModel = tool.pricing_model;
  const hasFreeTier = pricingModel?.free_tier || pricingModel?.type === 'free' || pricingModel?.type === 'freemium';

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Tool Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {tool.logo_url && !imageError ? (
              <div className="relative w-10 h-10">
                <Image
                  src={tool.logo_url}
                  alt={`${tool.name} logo`}
                  width={40}
                  height={40}
                  className="rounded-md object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-primary-500 text-white rounded-md flex items-center justify-center font-semibold">
                {tool.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                <Link href={`/tools/${tool.slug}`}>
                  {tool.name}
                </Link>
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {tool.average_rating && tool.average_rating > 0 && (
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-xs">{generateStars(tool.average_rating)}</span>
                    <span className="ml-1">{tool.average_rating.toFixed(1)}</span>
                  </div>
                )}
                {hasFreeTier && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Free Tier
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              tool.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {tool.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {tool.description}
        </p>

        {/* Categories */}
        {showCategories && tool.categories && tool.categories.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {tool.categories.slice(0, 3).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  <span className="mr-1">{getCategoryIcon(category.name)}</span>
                  {category.name}
                </Link>
              ))}
              {tool.categories.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                  +{tool.categories.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Roles */}
        {showRoles && tool.roles && tool.roles.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Recommended for:</p>
            <div className="flex flex-wrap gap-2">
              {tool.roles.slice(0, 3).map((role) => (
                <span
                  key={role.id}
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role.name)}`}
                >
                  {role.display_name}
                </span>
              ))}
              {tool.roles.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-500 rounded-full text-xs border border-gray-200">
                  +{tool.roles.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        {pricingModel && (
          <div className="mb-4">
            <div className="text-sm">
              {pricingModel.type === 'free' && (
                <span className="font-medium text-green-600">Free</span>
              )}
              {pricingModel.type === 'freemium' && (
                <span className="font-medium text-blue-600">
                  Freemium {pricingModel.price && `- from ${formatPricing(pricingModel.price, pricingModel.currency, pricingModel.billing_cycle)}`}
                </span>
              )}
              {pricingModel.type === 'paid' && pricingModel.price && (
                <span className="font-medium text-gray-900">
                  {formatPricing(pricingModel.price, pricingModel.currency, pricingModel.billing_cycle)}
                </span>
              )}
              {pricingModel.type === 'enterprise' && (
                <span className="font-medium text-purple-600">Enterprise</span>
              )}
              {pricingModel.trial_days && pricingModel.trial_days > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  {pricingModel.trial_days}-day trial
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            href={`/tools/${tool.slug}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View Details →
          </Link>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Add to favorites"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <a
              href={tool.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700 transition-colors"
            >
              Visit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}