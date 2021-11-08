import React, { useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";
import styled from "styled-components";
import Flex from "../../../../components/Box/Flex";
import { ChevronDownIcon } from "../../../../components/Svg";
import isTouchDevice from "../../../../util/isTouchDevice";
import { UserMenuProps, variants } from "./types";
import MenuIcon from "./MenuIcon";
import { UserMenuItem } from "./styles";

const StyledUserMenu = styled(Flex)`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.tertiary};
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  height: 48px;
  padding: 0px 24px;
  position: relative;

  &:hover {
    opacity: 0.65;
  }
`;

const LabelText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  display: none;
  font-weight: 600;

  ${({ theme }) => theme.mediaQueries.sm} {
    display: block;
    margin-left: 8px;
    margin-right: 4px;
  }
`;

const UserMenu: React.FC<UserMenuProps> = ({
  account,
  text,
  avatarSrc,
  variant = variants.DEFAULT,
  children,
  onUserMenuModal,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetRef, setTargetRef] = useState<HTMLDivElement | null>(null);
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);
  const hideTimeout = useRef<number>();
  const isHoveringOverTooltip = useRef(false);
  const accountEllipsis = account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : null;
  const { styles, attributes } = usePopper(targetRef, tooltipRef, {
    placement: "bottom-end",
    modifiers: [{ name: "offset", options: { offset: [0, 12] } }],
  });

  /**
   * See "useTooltip"
   */
  useEffect(() => {
    const showTooltip = (evt: MouseEvent | TouchEvent) => {
      setIsOpen(true);

      if (evt.target === targetRef) {
        clearTimeout(hideTimeout.current);
      }

      if (evt.target === tooltipRef) {
        isHoveringOverTooltip.current = true;
      }
    };

    const hideTooltip = (evt: MouseEvent | TouchEvent) => {
      if (hideTimeout.current) {
        window.clearTimeout(hideTimeout.current);
      }

      if (evt.target === tooltipRef) {
        isHoveringOverTooltip.current = false;
      }

      if (!isHoveringOverTooltip.current) {
        hideTimeout.current = window.setTimeout(() => {
          if (!isHoveringOverTooltip.current) {
            setIsOpen(false);
          }
        }, 150);
      }
    };

    const toggleTouch = (evt: TouchEvent) => {
      const target = evt.target as Node;
      const isTouchingTargetRef = target && targetRef?.contains(target);
      const isTouchingTooltipRef = target && tooltipRef?.contains(target);

      if (isTouchingTargetRef) {
        setIsOpen((prevOpen) => !prevOpen);
      } else if (isTouchingTooltipRef) {
        // Don't close the menu immediately so it catches the event
        setTimeout(() => {
          setIsOpen(false);
        }, 100);
      } else {
        setIsOpen(false);
      }
    };

    if (isTouchDevice()) {
      document.addEventListener("touchstart", toggleTouch);
    } else {
      targetRef?.addEventListener("mouseenter", showTooltip);
      targetRef?.addEventListener("mouseleave", hideTooltip);
      tooltipRef?.addEventListener("mouseenter", showTooltip);
      tooltipRef?.addEventListener("mouseleave", hideTooltip);
    }

    return () => {
      if (isTouchDevice()) {
        document.removeEventListener("touchstart", toggleTouch);
      } else {
        targetRef?.removeEventListener("mouseenter", showTooltip);
        targetRef?.removeEventListener("mouseleave", hideTooltip);
        tooltipRef?.removeEventListener("mouseenter", showTooltip);
        tooltipRef?.removeEventListener("mouseleave", hideTooltip);
      }
    };
  }, [targetRef, tooltipRef, hideTimeout, isHoveringOverTooltip, setIsOpen]);

  return (
    <>
      <StyledUserMenu onClick={onUserMenuModal} {...props}>
        {/* <MenuIcon avatarSrc={avatarSrc} variant={variant} /> */}
        <LabelText title={text || account}>{text || accountEllipsis}</LabelText>
        {/* <ChevronDownIcon color="text" width="24px" /> */}
      </StyledUserMenu>
      {/* <Menu style={styles.popper} {...attributes.popper} isOpen={isOpen}>
        {children}
      </Menu> */}
    </>
  );
};

export default UserMenu;
